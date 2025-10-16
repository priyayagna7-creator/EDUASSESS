import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import './Results.css';

const Results = () => {
  const location = useLocation();
  const [results, setResults] = useState([]);
  const [skillAnalysis, setSkillAnalysis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const [resultsData, skillData] = await Promise.all([
          assessmentService.getResults(),
          assessmentService.getSkillAnalysis()
        ]);
        
        setResults(resultsData);
        setSkillAnalysis(skillData);
        
        // If coming from assessment submission, show the latest result
        if (location.state?.result) {
          setSelectedResult(location.state.result);
        }
      } catch (err) {
        setError('Failed to load results');
        console.error('Results error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.state]);

  const getPerformanceLevel = (percentage) => {
    if (percentage >= 80) return { level: 'Excellent', color: '#28a745', icon: '🏆' };
    if (percentage >= 60) return { level: 'Good', color: '#17a2b8', icon: '👍' };
    if (percentage >= 40) return { level: 'Average', color: '#ffc107', icon: '📊' };
    return { level: 'Needs Improvement', color: '#dc3545', icon: '📈' };
  };

  const getPerformanceAdvice = (percentage) => {
    if (percentage >= 80) return "Outstanding performance! Keep up the excellent work and consider taking advanced assessments.";
    if (percentage >= 60) return "Good job! You're on the right track. Focus on the areas where you can improve further.";
    if (percentage >= 40) return "You have a solid foundation. Review the questions you missed and practice more in those areas.";
    return "Don't worry! This is a learning opportunity. Focus on understanding the concepts and try again.";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare data for charts
  const performanceData = results.map((result, index) => ({
    name: `Test ${index + 1}`,
    score: result.percentage,
    correct: result.correct_answers,
    total: result.total_questions
  }));

  const skillData = skillAnalysis.map(skill => ({
    name: skill.category,
    value: skill.averageScore,
    count: skill.totalAssessments
  }));

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
    <div className="results">
      <div className="results-header">
        <h1>Your Assessment Results</h1>
        <p>Track your progress and identify areas for improvement</p>
      </div>

      {selectedResult && location.state?.assessment && (
        <div className="latest-result">
          <div className="result-card latest">
            <div className="result-header">
              <h2>Latest Assessment Result</h2>
              <span className="result-date">
                {formatDate(location.state.result.submitted_at || new Date())}
              </span>
            </div>
            
            <div className="result-content">
              <div className="score-display">
                <div className="score-circle large">
                  <span className="score-value">{selectedResult.percentage}%</span>
                  <span className="score-label">Score</span>
                </div>
                <div className="score-details">
                  <h3>{location.state.assessment.title}</h3>
                  <p className="skill-category">{location.state.assessment.skill_category}</p>
                  <div className="score-breakdown">
                    <div className="breakdown-item">
                      <span className="breakdown-label">Correct Answers:</span>
                      <span className="breakdown-value">{selectedResult.correctAnswers} / {selectedResult.totalQuestions}</span>
                    </div>
                    <div className="breakdown-item">
                      <span className="breakdown-label">Time Spent:</span>
                      <span className="breakdown-value">
                        {location.state.timeSpent ? formatTime(location.state.timeSpent) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="performance-analysis">
                {(() => {
                  const performance = getPerformanceLevel(selectedResult.percentage);
                  return (
                    <div className="performance-card" style={{ borderColor: performance.color }}>
                      <div className="performance-icon">{performance.icon}</div>
                      <div className="performance-info">
                        <h4 style={{ color: performance.color }}>{performance.level}</h4>
                        <p>{getPerformanceAdvice(selectedResult.percentage)}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="results-content">
        <div className="results-section">
          <div className="section-header">
            <h2>Performance Overview</h2>
          </div>
          
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Score Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [value + '%', 'Score']}
                    labelFormatter={(label) => `Test: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#007bff" 
                    strokeWidth={3}
                    dot={{ fill: '#007bff', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-card">
              <h3>Skill Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value + '%', 'Average Score']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="results-section">
          <div className="section-header">
            <h2>All Results</h2>
            <Link to="/assessments" className="btn btn-outline">
              Take New Assessment
            </Link>
          </div>
          
          <div className="results-list">
            {results.length > 0 ? (
              results.map((result, index) => {
                const performance = getPerformanceLevel(result.percentage);
                return (
                  <div key={result.id} className="result-item">
                    <div className="result-info">
                      <h4>{result.assessment_title}</h4>
                      <p className="result-description">{result.assessment_description}</p>
                      <div className="result-meta">
                        <span className="result-date">{formatDate(result.submitted_at)}</span>
                        <span className="result-correct">
                          {result.correct_answers} / {result.total_questions} correct
                        </span>
                      </div>
                    </div>
                    
                    <div className="result-score">
                      <div 
                        className="score-circle"
                        style={{ borderColor: performance.color }}
                      >
                        {result.percentage}%
                      </div>
                      <div className="performance-info">
                        <span 
                          className="performance-level"
                          style={{ color: performance.color }}
                        >
                          {performance.level}
                        </span>
                        <span className="performance-icon">{performance.icon}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-results">
                <div className="no-results-content">
                  <h3>No Results Yet</h3>
                  <p>Complete your first assessment to see your results here</p>
                  <Link to="/assessments" className="btn btn-primary">
                    Browse Assessments
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {skillAnalysis.length > 0 && (
          <div className="results-section">
            <div className="section-header">
              <h2>Skill Analysis</h2>
            </div>
            
            <div className="skill-analysis">
              {skillAnalysis.map((skill, index) => (
                <div key={skill.category} className="skill-card">
                  <div className="skill-header">
                    <h4>{skill.category}</h4>
                    <span className="skill-score">{skill.averageScore}%</span>
                  </div>
                  
                  <div className="skill-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${skill.averageScore}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="skill-stats">
                    <div className="skill-stat">
                      <span className="stat-label">Assessments:</span>
                      <span className="stat-value">{skill.totalAssessments}</span>
                    </div>
                    <div className="skill-stat">
                      <span className="stat-label">Last Attempt:</span>
                      <span className="stat-value">
                        {skill.lastAttempt ? formatDate(skill.lastAttempt) : 'Never'}
                      </span>
                    </div>
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

export default Results;
