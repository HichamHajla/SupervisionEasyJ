import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // 1. NOTRE LOGIQUE D'AJOUT AUTOMATIQUE (qui va enfin pouvoir s'exécuter !)
    let finalEmail = identifiant.trim();
    if (!finalEmail.includes('@')) {
      finalEmail = finalEmail + '@gvapp.com'; 
    }

    // 2. ENVOI À SUPABASE
    const { error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="login-page-wrapper">
      <div className="login-box-strict">
        <h2 className="login-title">Suivi Procédure EasyJet</h2>
        <p className="login-subtitle">Portail de Coordination OPB</p>
        
        {error && <div className="login-error">Erreur d'identifiant ou de mot de passe</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="ui-group">
            <label>Identifiant</label>
            {/* LE FIX EST ICI : type="text" au lieu de "email" + désactivation majuscules */}
            <input 
              type="text" 
              value={identifiant} 
              onChange={(e) => setIdentifiant(e.target.value)} 
              required 
              autoCapitalize="none" 
              autoCorrect="off"
            />
          </div>
          <div className="ui-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}