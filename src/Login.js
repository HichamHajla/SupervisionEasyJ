import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  // On remplace 'email' par 'username' pour que ce soit plus clair
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // --- LA MAGIE EST ICI ---
    // On construit l'adresse email complète de manière invisible
    // On enlève aussi les espaces accidentels et on met en minuscules par sécurité
    const cleanUsername = username.trim().toLowerCase();
    const fullEmail = `${cleanUsername}@gvapp.com`;

    const { error } = await supabase.auth.signInWithPassword({
      email: fullEmail,
      password: password,
    });

    if (error) {
      setErrorMsg("Identifiant ou mot de passe incorrect.");
    }
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Suivi Procédure EasyJet</h1>
          <p>Portail de Coordination OPB</p>
        </div>

        {errorMsg && <div className="login-error">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="ui-group">
            <label>Identifiant</label>
            <input 
              type="text" 
              required 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoCapitalize="none" /* Empêche l'iPad de mettre une majuscule automatique */
              autoCorrect="off"
            />
          </div>
          
          <div className="ui-group">
            <label>Mot de passe</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{marginTop: '10px'}}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}