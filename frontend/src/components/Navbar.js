import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <h2>EDUASSESS</h2>
        </Link>
        
        <div className="navbar-menu">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="navbar-link">
                Dashboard
              </Link>
              <Link to="/assessments" className="navbar-link">
                Assessments
              </Link>
              <Link to="/results" className="navbar-link">
                Results
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="navbar-link">
                  Admin Panel
                </Link>
              )}
              <div className="navbar-user">
                <span className="navbar-username">
                  Welcome, {user?.name}
                </span>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/register" className="navbar-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
