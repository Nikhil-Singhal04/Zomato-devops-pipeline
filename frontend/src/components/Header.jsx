import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { currentUser, logout } from '../auth';

export default function Header() {
  const navigate = useNavigate();
  const user = currentUser();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className={scrolled ? 'scrolled' : ''}>
      <nav>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>
            <span role="img" aria-label="food">🍕</span>
            FoodHub
          </h1>
        </Link>
        
        <div>
          <Link to="/">Home</Link>
          
          {user ? (
            <>
              <span className="user-badge">
                <span role="img" aria-label="user">👤</span>
                {user.name}
              </span>
              <button 
                className="btn btn-danger" 
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
              <Link to="/signup" className="btn btn-secondary">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
