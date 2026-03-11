import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Formulaire from './Formulaire';
import Historique from './Historique';
import './Formulaire.css'; 

function TopBar({ theme, toggleTheme }) {
  const location = useLocation();
  const isHistorique = location.pathname === '/historique';

  return (
    <div className="top-bar-container">
      
      {/* TON NOUVEAU SWITCH THEME (UIVERSE) */}
      <label className="switch">
        <input 
          id="checkbox" 
          type="checkbox" 
          checked={theme === 'light'} 
          onChange={toggleTheme} 
        />
        <span className="slider">
          <div className="star star_1"></div>
          <div className="star star_2"></div>
          <div className="star star_3"></div>
          <svg viewBox="0 0 16 16" className="cloud_1 cloud">
            <path
              transform="matrix(.77976 0 0 .78395-299.99-418.63)"
              fill="#fff"
              d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925"
            ></path>
          </svg>
        </span>
      </label>
      
      {isHistorique ? (
        <Link to="/" className="top-action-btn">
          {/* TON NOUVEAU LOGO SUPERVISION (Adapté pour React & Mode Sombre) */}
          <svg
            className="top-icon"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeWidth="2"
              d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
              strokeLinejoin="round"
              strokeLinecap="round"
            ></path>
            <path
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
              d="M17 15V18M17 21V18M17 18H14M17 18H20"
            ></path>
          </svg>
          Supervision
        </Link>
      ) : (
     <Link to="/historique" className="top-action-btn">
          {/* TON NOUVEAU LOGO HISTORIQUE ASSORTI (Géométrique & Filaire) */}
          <svg
            className="top-icon"
            aria-hidden="true"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Le cercle parfait de l'horloge */}
            <circle cx="12" cy="12" r="10" strokeLinejoin="round" strokeLinecap="round"></circle>
            {/* Les aiguilles géométriques (perpendiculaires comme ton 'plus') */}
            <path
              d="M12 6V12H16"
              strokeLinejoin="round"
              strokeLinecap="round"
              strokeWidth="2"
            ></path>
          </svg>
          Historique
        </Link>
      )}
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <Router>
      <div className={`app-wrapper ${theme}`}>
        <div className="app-container">
          <TopBar theme={theme} toggleTheme={toggleTheme} />
          
          <Routes>
            <Route path="/" element={<Formulaire />} />
            <Route path="/historique" element={<Historique />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;