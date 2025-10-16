import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { assessmentService } from '../services/assessmentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [results, setResults] = useState([]);
  const [skillAnalysis, setSkillAnalysis] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [assessmentsData, resultsData, skillData, leaderboardData] = await Promise.all([
          assessmentService.getAssessments(),
          assessmentService.getResults(),
          assessmentService.getSkillAnalysis(),
          assessmentService.getLeaderboard()
        ]);
        
        setAssessments(assessmentsData.slice(0, 3)); // Show only 3 recent assessments
        setResults(resultsData.slice(0, 5)); // Show only 5 recent results
        setSkillAnalysis(skillData);
        setLeaderboard(leaderboardData.slice(0, 10));
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Excellent', color: '#28a745' };
    if (percentage >= 60) return { level: 'Good', color: '#17a2b8' };
    if (percentage >= 40) return { level: 'Average', color: '#ffc107' };
    return { level: 'Needs Improvement', color: '#dc3545' };
  };

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
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}!</h1>
        <p>Track your progress and continue your learning journey</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{results.length}</h3>
            <p>Assessments Completed</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>
              {results.length > 0 
                ? Math.round(results.reduce((acc, result) => acc + result.percentage, 0) / results.length)
                : 0
              }%
            </h3>
            <p>Average Score</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>{assessments.length}</h3>
            <p>Available Assessments</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <h3>
              {results.filter(result => result.percentage >= 80).length}
            </h3>
            <p>Excellent Scores</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Assessments</h2>
            <Link to="/assessments" className="btn btn-outline">
              View All
            </Link>
          </div>
          
          <div className="assessments-grid">
            {assessments.map(assessment => (
              <div key={assessment.id} className="assessment-card">
                <div className="assessment-header">
                  <h3>{assessment.title}</h3>
                  <span className="skill-category">{assessment.skill_category}</span>
                </div>
                <p className="assessment-description">{assessment.description}</p>
                <Link 
                  to={`/assessment/${assessment.id}`}
                  className="btn btn-primary"
                >
                  Start Assessment
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Leaderboard</h2>
          </div>
          <div className="leaderboard-list">
            {leaderboard.length === 0 && <p>No leaderboard data yet.</p>}
            {leaderboard.map((row, index) => (
              <div key={row.user_id} className="leaderboard-item">
                <div className="rank">#{index + 1}</div>
                <div className="user">
                  <div className="name">{row.user_name}</div>
                  <div className="email">{row.user_email}</div>
                </div>
                <div className="stats">
                  <span className="avg">{row.average_percentage}%</span>
                  <span className="attempts">{row.attempts} attempts</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Results</h2>
            <Link to="/results" className="btn btn-outline">
              View All
            </Link>
          </div>
          
          <div className="results-list">
            {results.length > 0 ? (
              results.map(result => {
                const performance = getPerformanceLevel(result.percentage);
                return (
                  <div key={result.id} className="result-item">
                    <div className="result-info">
                      <h4>{result.assessment_title}</h4>
                      <p className="result-date">
                        {new Date(result.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="result-score">
                      <div 
                        className="score-circle"
                        style={{ borderColor: performance.color }}
                      >
                        {result.percentage}%
                      </div>
                      <span 
                        className="performance-level"
                        style={{ color: performance.color }}
                      >
                        {performance.level}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <p>No assessments completed yet. Start your first assessment!</p>
                <Link to="/assessments" className="btn btn-primary">
                  Browse Assessments
                </Link>
              </div>
            )}
          </div>
        </div>

        {skillAnalysis.length > 0 && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Skill Analysis</h2>
            </div>
            
            <div className="skill-analysis">
              <div className="skill-chart">
                <h3>Performance by Skill Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={skillAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="averageScore" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="skill-list">
                <h3>Skill Breakdown</h3>
                {skillAnalysis.map((skill, index) => (
                  <div key={skill.category} className="skill-item">
                    <div className="skill-info">
                      <h4>{skill.category}</h4>
                      <p>{skill.totalAssessments} assessments completed</p>
                    </div>
                    <div className="skill-score">
                      <div className="score-bar">
                        <div 
                          className="score-fill"
                          style={{ 
                            width: `${skill.averageScore}%`,
                            backgroundColor: COLORS[index % COLORS.length]
                          }}
                        ></div>
                      </div>
                      <span className="score-text">{skill.averageScore}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
