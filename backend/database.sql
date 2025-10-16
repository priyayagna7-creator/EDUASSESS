-- EDUASSESS Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS eduassess;
USE eduassess;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    skill_category VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    assessment_id INT NOT NULL,
    question_text TEXT NOT NULL,
    option_a VARCHAR(255) NOT NULL,
    option_b VARCHAR(255) NOT NULL,
    option_c VARCHAR(255),
    option_d VARCHAR(255),
    correct_answer ENUM('A', 'B', 'C', 'D') NOT NULL,
    points INT DEFAULT 1,
    question_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Assessment results table
CREATE TABLE assessment_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    assessment_id INT NOT NULL,
    score INT NOT NULL,
    total_score INT NOT NULL,
    percentage INT NOT NULL,
    correct_answers INT NOT NULL,
    total_questions INT NOT NULL,
    answers JSON,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
);

-- Insert sample data

-- Sample admin user (password: admin123)
INSERT INTO users (email, password, name, role) VALUES 
('admin@eduassess.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin User', 'admin');

-- Sample student user (password: student123)
INSERT INTO users (email, password, name, role) VALUES 
('student@eduassess.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Student User', 'student');

-- Sample assessments
INSERT INTO assessments (title, description, skill_category) VALUES 
('JavaScript Fundamentals', 'Test your knowledge of JavaScript basics including variables, functions, and control structures.', 'Programming'),
('React.js Concepts', 'Assess your understanding of React components, hooks, and state management.', 'Programming'),
('Problem Solving', 'Evaluate your analytical thinking and problem-solving abilities.', 'Critical Thinking'),
('Communication Skills', 'Test your written and verbal communication capabilities.', 'Soft Skills'),
('Mathematics Basics', 'Assess fundamental mathematical concepts and problem-solving.', 'Mathematics');

-- Sample questions for JavaScript Fundamentals
INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES 
(1, 'What is the correct way to declare a variable in JavaScript?', 'var name = "John";', 'variable name = "John";', 'v name = "John";', 'declare name = "John";', 'A', 1, 1),
(1, 'Which method is used to add an element to the end of an array?', 'push()', 'pop()', 'shift()', 'unshift()', 'A', 1, 2),
(1, 'What does the === operator do?', 'Assigns a value', 'Compares values and types', 'Compares only values', 'Checks if variables exist', 'B', 1, 3),
(1, 'Which keyword is used to declare a function in JavaScript?', 'function', 'def', 'func', 'declare', 'A', 1, 4),
(1, 'What will console.log(typeof null) output?', 'null', 'undefined', 'object', 'string', 'C', 1, 5);

-- Sample questions for React.js Concepts
INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES 
(2, 'What is a React component?', 'A JavaScript function that returns HTML', 'A CSS class', 'A database table', 'A server endpoint', 'A', 1, 1),
(2, 'Which hook is used to manage state in functional components?', 'useState', 'useEffect', 'useContext', 'useReducer', 'A', 1, 2),
(2, 'What does JSX stand for?', 'JavaScript XML', 'JavaScript Extension', 'Java Syntax Extension', 'JSON XML', 'A', 1, 3),
(2, 'Which method is called when a component is first rendered?', 'componentDidMount', 'componentWillMount', 'useEffect with empty dependency array', 'Both A and C', 'D', 1, 4),
(2, 'What is the purpose of keys in React lists?', 'To style elements', 'To identify unique elements', 'To add event listeners', 'To create animations', 'B', 1, 5);

-- Sample questions for Problem Solving
INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES 
(3, 'If a train travels 120 miles in 2 hours, what is its average speed?', '60 mph', '240 mph', '30 mph', '120 mph', 'A', 1, 1),
(3, 'What is the next number in the sequence: 2, 4, 8, 16, ?', '24', '32', '20', '28', 'B', 1, 2),
(3, 'If you have 5 red balls and 3 blue balls, what is the probability of picking a red ball?', '3/8', '5/8', '1/2', '2/3', 'B', 1, 3),
(3, 'A rectangle has a length of 10 and width of 6. What is its area?', '16', '32', '60', '26', 'C', 1, 4),
(3, 'If x + 5 = 12, what is the value of x?', '7', '17', '2.4', '60', 'A', 1, 5);

-- Sample questions for Communication Skills
INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES 
(4, 'Which is the most effective way to start a professional email?', 'Hey there!', 'Dear Sir/Madam,', 'Hi [Name],', 'To whom it may concern,', 'C', 1, 1),
(4, 'What is active listening?', 'Speaking while others talk', 'Fully concentrating on the speaker', 'Taking notes only', 'Interrupting to ask questions', 'B', 1, 2),
(4, 'Which communication style is most effective in a team setting?', 'Aggressive', 'Passive', 'Assertive', 'Passive-aggressive', 'C', 1, 3),
(4, 'What is the purpose of a meeting agenda?', 'To fill time', 'To provide structure and focus', 'To impress attendees', 'To avoid discussion', 'B', 1, 4),
(4, 'Which is the best way to give constructive feedback?', 'Be vague and general', 'Focus on the person, not the behavior', 'Be specific and focus on behavior', 'Give feedback in public', 'C', 1, 5);

-- Sample questions for Mathematics Basics
INSERT INTO questions (assessment_id, question_text, option_a, option_b, option_c, option_d, correct_answer, points, question_order) VALUES 
(5, 'What is 15% of 200?', '30', '25', '35', '20', 'A', 1, 1),
(5, 'Solve for x: 2x + 5 = 13', 'x = 4', 'x = 9', 'x = 6', 'x = 3', 'A', 1, 2),
(5, 'What is the area of a circle with radius 7? (Use π = 3.14)', '153.86', '43.96', '21.98', '87.92', 'A', 1, 3),
(5, 'What is the square root of 144?', '12', '14', '11', '13', 'A', 1, 4),
(5, 'If a triangle has angles of 30°, 60°, and 90°, what type of triangle is it?', 'Equilateral', 'Isosceles', 'Right', 'Obtuse', 'C', 1, 5);
