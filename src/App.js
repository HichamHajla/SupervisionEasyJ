import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Formulaire from './Formulaire';
import Historique from './Historique';
import Login from './Login';
import './Formulaire.css';

function MainApp({ theme, toggleTheme, handleLogout }) {
  const location = useLocation();

  return (
    <div className={`app-wrapper ${theme}`}>
      <div className="app-container">
        
        <div className="top-bar-container hide-on-print">
          
          <label className="switch">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'light'} />
            <span className="slider">
              <span className="star star_1"></span>
              <span className="star star_2"></span>
              <span className="star star_3"></span>
              <svg className="cloud" viewBox="0 0 100 100">
                <path d="M 50 20 Q 70 20 70 40 Q 90 40 90 60 Q 90 80 50 80 Q 10 80 10 60 Q 10 40 30 40 Q 30 20 50 20 Z" fill="white"></path>
              </svg>
            </span>
          </label>

          {location.pathname === '/' ? (
            <Link to="/historique" className="top-action-btn">
              <svg className="top-icon" aria-hidden="true" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" strokeLinejoin="round" strokeLinecap="round"></circle>
                <path d="M12 6V12H16" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2"></path>
              </svg>
              Historique
            </Link>
          ) : (
            <Link to="/" className="top-action-btn">
              <svg className="top-icon" aria-hidden="true" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path strokeWidth="2" d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125" strokeLinejoin="round" strokeLinecap="round"></path>
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" d="M17 15V18M17 21V18M17 18H14M17 18H20"></path>
              </svg>
              Supervision
            </Link>
          )}

        </div>

        <Routes>
          <Route path="/" element={<Formulaire />} />
          <Route path="/historique" element={<Historique />} />
        </Routes>

        {/* LE BOUTON EST MAINTENANT ICI, EN BAS DE LA PAGE */}
        <div className="logout-container hide-on-print">
          <button onClick={handleLogout} className="logout-btn-bottom">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className={`app-wrapper ${theme}`} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><p>Chargement...</p></div>;
  }

  if (!session) {
    return (
      <div className={`app-wrapper ${theme}`}>
        <Login />
      </div>
    );
  }

  return (
    <Router>
      <MainApp theme={theme} toggleTheme={toggleTheme} handleLogout={handleLogout} />
    </Router>
  );
}

export default App;