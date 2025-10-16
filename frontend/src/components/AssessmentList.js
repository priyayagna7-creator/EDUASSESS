import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import './AssessmentList.css';

const AssessmentList = () => {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getAssessments();
        setAssessments(data);
      } catch (err) {
        setError('Failed to load assessments');
        console.error('Assessment list error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, []);

  const getSkillCategories = () => {
    const categories = [...new Set(assessments.map(assessment => assessment.skill_category))];
    return categories;
  };

  const filteredAssessments = assessments.filter(assessment => {
    const matchesFilter = filter === 'all' || assessment.skill_category === filter;
    const matchesSearch = assessment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assessment.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Programming': '#007bff',
      'Mathematics': '#28a745',
      'Critical Thinking': '#ffc107',
      'Soft Skills': '#17a2b8',
      'General': '#6c757d'
    };
    return colors[category] || '#6c757d';
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
    <div className="assessment-list">
      <div className="assessment-header">
        <h1>Available Assessments</h1>
        <p>Choose an assessment to test your skills and track your progress</p>
      </div>

      <div className="assessment-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search assessments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Categories
          </button>
          {getSkillCategories().map(category => (
            <button
              key={category}
              className={`filter-btn ${filter === category ? 'active' : ''}`}
              onClick={() => setFilter(category)}
              style={{ 
                borderColor: getCategoryColor(category),
                color: filter === category ? 'white' : getCategoryColor(category),
                backgroundColor: filter === category ? getCategoryColor(category) : 'transparent'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="assessments-grid">
        {filteredAssessments.length > 0 ? (
          filteredAssessments.map(assessment => (
            <div key={assessment.id} className="assessment-card">
              <div className="assessment-card-header">
                <div className="assessment-title-section">
                  <h3>{assessment.title}</h3>
                  <span 
                    className="skill-category"
                    style={{ 
                      backgroundColor: getCategoryColor(assessment.skill_category),
                      color: 'white'
                    }}
                  >
                    {assessment.skill_category}
                  </span>
                </div>
                <div className="assessment-meta">
                  <span className="question-count">
                    {assessment.question_count || 'Multiple'} Questions
                  </span>
                </div>
              </div>
              
              <div className="assessment-description">
                <p>{assessment.description}</p>
              </div>
              
              <div className="assessment-actions">
                <Link 
                  to={`/assessment/${assessment.id}`}
                  className="btn btn-primary"
                >
                  Start Assessment
                </Link>
                <div className="assessment-info">
                  <small>
                    Created: {new Date(assessment.created_at).toLocaleDateString()}
                  </small>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-assessments">
            <div className="no-assessments-content">
              <h3>No assessments found</h3>
              <p>
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No assessments are currently available'
                }
              </p>
              {(searchTerm || filter !== 'all') && (
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilter('all');
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {filteredAssessments.length > 0 && (
        <div className="assessment-stats">
          <p>
            Showing {filteredAssessments.length} of {assessments.length} assessments
          </p>
        </div>
      )}
    </div>
  );
};

export default AssessmentList;
