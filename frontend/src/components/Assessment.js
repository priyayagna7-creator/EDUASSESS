import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assessmentService } from '../services/assessmentService';
import './Assessment.css';

const Assessment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setLoading(true);
        const data = await assessmentService.getAssessment(id);
        setAssessment(data.assessment);
        // Deduplicate questions by id to avoid repeated rendering
        const seenQuestionIds = new Set();
        const uniqueQuestions = (data.questions || []).filter((q) => {
          if (!q || seenQuestionIds.has(q.id)) return false;
          seenQuestionIds.add(q.id);
          return true;
        });
        setQuestions(uniqueQuestions);
        setStartTime(Date.now());
        setTimeLeft(30 * 60 * 1000); // 30 minutes in milliseconds
      } catch (err) {
        setError('Failed to load assessment');
        console.error('Assessment error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1000);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
  }, [timeLeft]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const answersArray = Object.entries(answers).map(([questionId, answer]) => ({
        questionId: parseInt(questionId),
        answer: answer
      }));

      const result = await assessmentService.submitAssessment(id, answersArray);
      
      // Navigate to results page with the result data
      navigate('/results', { 
        state: { 
          result: result.result,
          assessment: assessment,
          timeSpent: startTime ? Date.now() - startTime : 0
        }
      });
    } catch (err) {
      setError('Failed to submit assessment');
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return ((currentQuestion + 1) / questions.length) * 100;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
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

  if (!assessment || !questions.length) {
    return (
      <div className="alert alert-danger">
        Assessment not found
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="assessment">
      <div className="assessment-header">
        <div className="assessment-info">
          <h1>{assessment.title}</h1>
          <p className="assessment-description">{assessment.description}</p>
          <div className="assessment-meta">
            <span className="skill-category">{assessment.skill_category}</span>
            <span className="question-count">{questions.length} Questions</span>
          </div>
        </div>
        
        <div className="assessment-timer">
          <div className="timer-circle">
            <span className="timer-text">{formatTime(timeLeft)}</span>
          </div>
          <p className="timer-label">Time Remaining</p>
        </div>
      </div>

      <div className="assessment-progress">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgress()}%` }}
          ></div>
        </div>
        <div className="progress-info">
          <span>Question {currentQuestion + 1} of {questions.length}</span>
          <span>{getAnsweredCount()} answered</span>
        </div>
      </div>

      <div className="question-container">
        <div className="question-card">
          <div className="question-header">
            <h2>Question {currentQuestion + 1}</h2>
            <span className="question-points">{question.points} point{question.points !== 1 ? 's' : ''}</span>
          </div>
          
          <div className="question-text">
            <p>{question.question_text}</p>
          </div>

          <div className="question-options">
            {['A', 'B', 'C', 'D'].map(option => {
              const optionText = question[`option_${option.toLowerCase()}`];
              if (!optionText) return null;
              
              return (
                <label 
                  key={option} 
                  className={`option-label ${answers[question.id] === option ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={option}
                    checked={answers[question.id] === option}
                    onChange={() => handleAnswerChange(question.id, option)}
                    className="option-input"
                  />
                  <span className="option-letter">{option}</span>
                  <span className="option-text">{optionText}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="question-navigation">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>
          
          <div className="question-numbers">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`question-number ${index === currentQuestion ? 'active' : ''} ${answers[questions[index].id] ? 'answered' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn btn-success"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>

      <div className="assessment-summary">
        <div className="summary-stats">
          <div className="stat">
            <span className="stat-value">{getAnsweredCount()}</span>
            <span className="stat-label">Answered</span>
          </div>
          <div className="stat">
            <span className="stat-value">{questions.length - getAnsweredCount()}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat">
            <span className="stat-value">{Math.round(getProgress())}%</span>
            <span className="stat-label">Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
