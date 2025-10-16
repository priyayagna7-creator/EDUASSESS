const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'eduassess'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/auth/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim(),
  body('role').isIn(['student', 'admin'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, role } = req.body;

    // Check if user already exists
    const [existingUser] = await db.promise().query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.promise().query(
      'INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, role]
    );

    const token = jwt.sign(
      { userId: result.insertId, email, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: result.insertId, email, name, role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [users] = await db.promise().query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.promise().query(
      'SELECT id, email, name, role FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all assessments
app.get('/api/assessments', authenticateToken, async (req, res) => {
  try {
    const [assessments] = await db.promise().query(
      'SELECT * FROM assessments WHERE is_active = 1 ORDER BY created_at DESC'
    );
    res.json(assessments);
  } catch (error) {
    console.error('Assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assessment by ID with questions
app.get('/api/assessments/:id', authenticateToken, async (req, res) => {
  try {
    const assessmentId = req.params.id;

    // Get assessment details
    const [assessments] = await db.promise().query(
      'SELECT * FROM assessments WHERE id = ? AND is_active = 1',
      [assessmentId]
    );

    if (assessments.length === 0) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Get questions for this assessment (select distinct rows to avoid duplicates)
    const [questions] = await db.promise().query(
      `SELECT DISTINCT id, assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order, created_at
       FROM questions
       WHERE assessment_id = ?
       ORDER BY question_order`,
      [assessmentId]
    );

    res.json({
      assessment: assessments[0],
      questions: questions
    });
  } catch (error) {
    console.error('Assessment details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assessment answers
app.post('/api/assessments/:id/submit', authenticateToken, [
  body('answers').isArray(),
  body('answers.*.questionId').isInt(),
  body('answers.*.answer').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const assessmentId = req.params.id;
    const { answers } = req.body;
    const userId = req.user.userId;

    // Calculate score
    let totalScore = 0;
    let correctAnswers = 0;

    for (const answer of answers) {
      const [questions] = await db.promise().query(
        'SELECT correct_answer, points FROM questions WHERE id = ? AND assessment_id = ?',
        [answer.questionId, assessmentId]
      );

      if (questions.length > 0) {
        const question = questions[0];
        if (answer.answer === question.correct_answer) {
          correctAnswers++;
          totalScore += question.points;
        }
      }
    }

    // Get total possible points
    const [totalPointsResult] = await db.promise().query(
      'SELECT SUM(points) as total_points FROM questions WHERE assessment_id = ?',
      [assessmentId]
    );
    const totalPoints = totalPointsResult[0].total_points || 0;

    // Calculate percentage
    const percentage = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;

    // Save result
    const [result] = await db.promise().query(
      'INSERT INTO assessment_results (user_id, assessment_id, score, total_score, percentage, correct_answers, total_questions, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, assessmentId, totalScore, totalPoints, percentage, correctAnswers, answers.length, JSON.stringify(answers)]
    );

    res.json({
      message: 'Assessment submitted successfully',
      result: {
        id: result.insertId,
        score: totalScore,
        totalScore: totalPoints,
        percentage: percentage,
        correctAnswers: correctAnswers,
        totalQuestions: answers.length
      }
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's assessment results
app.get('/api/results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [results] = await db.promise().query(`
      SELECT ar.*, a.title as assessment_title, a.description as assessment_description
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      WHERE ar.user_id = ?
      ORDER BY ar.submitted_at DESC
    `, [userId]);

    res.json(results);
  } catch (error) {
    console.error('Results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get skill analysis for user
app.get('/api/skills/analysis', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get all results with skill categories
    const [results] = await db.promise().query(`
      SELECT ar.*, a.title, a.skill_category
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      WHERE ar.user_id = ?
      ORDER BY ar.submitted_at DESC
    `, [userId]);

    // Group by skill category
    const skillAnalysis = {};
    results.forEach(result => {
      const category = result.skill_category || 'General';
      if (!skillAnalysis[category]) {
        skillAnalysis[category] = {
          category,
          totalAssessments: 0,
          averageScore: 0,
          totalScore: 0,
          lastAttempt: null
        };
      }
      
      skillAnalysis[category].totalAssessments++;
      skillAnalysis[category].totalScore += result.percentage;
      skillAnalysis[category].averageScore = Math.round(skillAnalysis[category].totalScore / skillAnalysis[category].totalAssessments);
      
      if (!skillAnalysis[category].lastAttempt || new Date(result.submitted_at) > new Date(skillAnalysis[category].lastAttempt)) {
        skillAnalysis[category].lastAttempt = result.submitted_at;
      }
    });

    res.json(Object.values(skillAnalysis));
  } catch (error) {
    console.error('Skill analysis error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/api/admin/assessments', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [assessments] = await db.promise().query(`
      SELECT a.*, COUNT(q.id) as question_count
      FROM assessments a
      LEFT JOIN questions q ON a.id = q.assessment_id
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `);

    res.json(assessments);
  } catch (error) {
    console.error('Admin assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create assessment (Admin only)
app.post('/api/admin/assessments', authenticateToken, [
  body('title').notEmpty().trim(),
  body('description').notEmpty().trim(),
  body('skill_category').notEmpty().trim(),
  body('questions').isArray().isLength({ min: 1 })
], async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, skill_category, questions } = req.body;

    // Create assessment
    const [assessmentResult] = await db.promise().query(
      'INSERT INTO assessments (title, description, skill_category, is_active) VALUES (?, ?, ?, 1)',
      [title, description, skill_category]
    );

    const assessmentId = assessmentResult.insertId;

    // Create questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      await db.promise().query(
        'INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          assessmentId,
          question.question_text,
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d,
          question.correct_answer,
          question.points || 1,
          i + 1
        ]
      );
    }

    res.status(201).json({
      message: 'Assessment created successfully',
      assessmentId: assessmentId
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Admin only)
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const [users] = await db.promise().query(
      'SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC'
    );

    res.json(users);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin analytics
app.get('/api/admin/analytics', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Get total users
    const [userCount] = await db.promise().query('SELECT COUNT(*) as count FROM users');
    
    // Get total assessments
    const [assessmentCount] = await db.promise().query('SELECT COUNT(*) as count FROM assessments');
    
    // Get total results
    const [resultCount] = await db.promise().query('SELECT COUNT(*) as count FROM assessment_results');
    
    // Get average scores by skill category
    const [skillStats] = await db.promise().query(`
      SELECT a.skill_category, AVG(ar.percentage) as average_score, COUNT(ar.id) as total_attempts
      FROM assessment_results ar
      JOIN assessments a ON ar.assessment_id = a.id
      GROUP BY a.skill_category
    `);

    res.json({
      totalUsers: userCount[0].count,
      totalAssessments: assessmentCount[0].count,
      totalResults: resultCount[0].count,
      skillStats: skillStats
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'EDUASSESS API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
