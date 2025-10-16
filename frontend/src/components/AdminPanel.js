import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './AdminPanel.css';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: '',
    description: '',
    skill_category: '',
    questions: []
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);
        const [analyticsData, assessmentsData, usersData] = await Promise.all([
          adminService.getAnalytics(),
          adminService.getAssessments(),
          adminService.getUsers()
        ]);
        
        setAnalytics(analyticsData);
        setAssessments(assessmentsData);
        setUsers(usersData);
      } catch (err) {
        setError('Failed to load admin data');
        console.error('Admin panel error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    try {
      await adminService.createAssessment(newAssessment);
      setShowCreateForm(false);
      setNewAssessment({
        title: '',
        description: '',
        skill_category: '',
        questions: []
      });
      // Refresh assessments
      const assessmentsData = await adminService.getAssessments();
      setAssessments(assessmentsData);
    } catch (err) {
      setError('Failed to create assessment');
      console.error('Create assessment error:', err);
    }
  };

  const addQuestion = () => {
    setNewAssessment({
      ...newAssessment,
      questions: [
        ...newAssessment.questions,
        {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_answer: 'A',
          points: 1
        }
      ]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...newAssessment.questions];
    updatedQuestions[index][field] = value;
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = newAssessment.questions.filter((_, i) => i !== index);
    setNewAssessment({
      ...newAssessment,
      questions: updatedQuestions
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage assessments, users, and view analytics</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'assessments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assessments')}
        >
          Assessments
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
      </div>

      <div className="admin-content">
        {activeTab === 'overview' && analytics && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{analytics.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <h3>{analytics.totalAssessments}</h3>
                  <p>Total Assessments</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{analytics.totalResults}</h3>
                  <p>Total Submissions</p>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Average Scores by Skill Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.skillStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="skill_category" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => [value + '%', 'Average Score']} />
                    <Bar dataKey="average_score" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assessments' && (
          <div className="assessments-tab">
            <div className="tab-header">
              <h2>Manage Assessments</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateForm(true)}
              >
                Create New Assessment
              </button>
            </div>

            {showCreateForm && (
              <div className="create-form-overlay">
                <div className="create-form">
                  <div className="form-header">
                    <h3>Create New Assessment</h3>
                    <button
                      className="close-btn"
                      onClick={() => setShowCreateForm(false)}
                    >
                      ×
                    </button>
                  </div>
                  
                  <form onSubmit={handleCreateAssessment}>
                    <div className="form-group">
                      <label className="form-label">Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={newAssessment.title}
                        onChange={(e) => setNewAssessment({
                          ...newAssessment,
                          title: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-textarea"
                        value={newAssessment.description}
                        onChange={(e) => setNewAssessment({
                          ...newAssessment,
                          description: e.target.value
                        })}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label">Skill Category</label>
                      <select
                        className="form-select"
                        value={newAssessment.skill_category}
                        onChange={(e) => setNewAssessment({
                          ...newAssessment,
                          skill_category: e.target.value
                        })}
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Programming">Programming</option>
                        <option value="Mathematics">Mathematics</option>
                        <option value="Critical Thinking">Critical Thinking</option>
                        <option value="Soft Skills">Soft Skills</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div className="questions-section">
                      <div className="questions-header">
                        <h4>Questions</h4>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={addQuestion}
                        >
                          Add Question
                        </button>
                      </div>
                      
                      {newAssessment.questions.map((question, index) => (
                        <div key={index} className="question-form">
                          <div className="question-header">
                            <h5>Question {index + 1}</h5>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => removeQuestion(index)}
                            >
                              Remove
                            </button>
                          </div>
                          
                          <div className="form-group">
                            <label className="form-label">Question Text</label>
                            <textarea
                              className="form-textarea"
                              value={question.question_text}
                              onChange={(e) => updateQuestion(index, 'question_text', e.target.value)}
                              required
                            />
                          </div>
                          
                          <div className="options-grid">
                            {['A', 'B', 'C', 'D'].map(option => (
                              <div key={option} className="form-group">
                                <label className="form-label">Option {option}</label>
                                <input
                                  type="text"
                                  className="form-input"
                                  value={question[`option_${option.toLowerCase()}`]}
                                  onChange={(e) => updateQuestion(index, `option_${option.toLowerCase()}`, e.target.value)}
                                  required
                                />
                              </div>
                            ))}
                          </div>
                          
                          <div className="question-settings">
                            <div className="form-group">
                              <label className="form-label">Correct Answer</label>
                              <select
                                className="form-select"
                                value={question.correct_answer}
                                onChange={(e) => updateQuestion(index, 'correct_answer', e.target.value)}
                                required
                              >
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                              </select>
                            </div>
                            
                            <div className="form-group">
                              <label className="form-label">Points</label>
                              <input
                                type="number"
                                className="form-input"
                                value={question.points}
                                onChange={(e) => updateQuestion(index, 'points', parseInt(e.target.value))}
                                min="1"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCreateForm(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={newAssessment.questions.length === 0}
                      >
                        Create Assessment
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="assessments-list">
              {assessments.map(assessment => (
                <div key={assessment.id} className="assessment-item">
                  <div className="assessment-info">
                    <h4>{assessment.title}</h4>
                    <p>{assessment.description}</p>
                    <div className="assessment-meta">
                      <span className="skill-category">{assessment.skill_category}</span>
                      <span className="question-count">{assessment.question_count} questions</span>
                      <span className="created-date">
                        Created: {new Date(assessment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="assessment-actions">
                    <span className={`status ${assessment.is_active ? 'active' : 'inactive'}`}>
                      {assessment.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>User Management</h2>
            </div>
            
            <div className="users-list">
              {users.map(user => (
                <div key={user.id} className="user-item">
                  <div className="user-info">
                    <h4>{user.name}</h4>
                    <p>{user.email}</p>
                    <span className="user-role">{user.role}</span>
                  </div>
                  
                  <div className="user-meta">
                    <span className="join-date">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
