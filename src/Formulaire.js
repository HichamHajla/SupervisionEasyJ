import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Formulaire() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const gates = [
    'A6', 'A7', 'F15', 'F16', 'F17', 
    'B21', 'B23', 'B25', 'B27', 'B31', 'B32', 'B33', 'B34', 'B41', 
    'B42', 'B43', 'B44', 'C58', 'C59', 'C62', 'D71', 'D72', 'D75', 
    'D76', 'D81', 'D82', 'D85', 'D86'
  ];

  const [formData, setFormData] = useState({
    dossier: '', date_vol: '', immatriculation: '', gate: '',
    nombre_bus: '', nombre_clients: '', heure_tobt: '',
    heure_arrivee_agent: '', speedy_boarding: null, bon_deroulement: null,
    debut_chargement: '', contact_radio: null, probleme_avion: null,
    remarque_probleme: '', depart_premier_bus: '', attente_avion: null,
    temps_attente_min: '', plm: null, retard_depart: null,
    ir_87: null, remarque_globale: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggle = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGateSelect = (gate) => {
    setFormData(prev => ({ ...prev, gate }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // --- LE FILTRE MAGIQUE EST ICI ---
    // On crée une copie des données pour les nettoyer avant l'envoi
    const payload = { ...formData };

    // Supabase n'accepte pas "" pour les champs numériques (integer). 
    // On remplace les champs vides par 'null'.
    if (payload.nombre_bus === '') payload.nombre_bus = null;
    if (payload.nombre_clients === '') payload.nombre_clients = null;
    if (payload.temps_attente_min === '') payload.temps_attente_min = null;
    
    // NB: Si ton champ "Dossier" est aussi configuré en "integer" (nombre) dans Supabase,
    // on lui applique le même traitement de sécurité.
    if (payload.dossier === '') payload.dossier = null;

    // --- FIN DU FILTRE ---

    const { error } = await supabase.from('fiches_coordination').insert([payload]);

    if (error) {
      alert("Erreur : " + error.message);
    } else {
      setSuccess(true);
      window.scrollTo(0, 0);
    }
    setLoading(false);
  };

  const renderOuiNon = (name, label) => (
    <div className="ui-group">
      <label>{label}</label>
      <div className="toggle-container">
        <button 
          type="button" 
          className={`toggle-btn ${formData[name] === true ? 'active-oui' : ''}`}
          onClick={() => handleToggle(name, true)}
        >OUI</button>
        <button 
          type="button" 
          className={`toggle-btn ${formData[name] === false ? 'active-non' : ''}`}
          onClick={() => handleToggle(name, false)}
        >NON</button>
      </div>
    </div>
  );

  if (success) {
    return (
      <div className="success-screen">
        <div className="success-card">
          <h2>Fiche Transmise</h2>
          <p>Les données ont été synchronisées avec succès.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>Nouvelle supervision</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="app-header">
        <h1>Suivi Procédure EasyJet</h1>
        <p className="subtitle">GREVAZ Gaël : Coordinateur OPB</p>
      </header>

      <form className="modern-form" onSubmit={handleSubmit}>
        
        <div className="form-card">
          <div className="ui-group">
            <label>Dossier (Numéro)</label>
            <input type="text" name="dossier" required onChange={handleChange} placeholder="Ex: 1, 2, 3..." />
          </div>
        </div>

        <div className="form-card">
          <div className="grid-2">
            <div className="ui-group">
              <label>Date</label>
              <input type="date" name="date_vol" required onChange={handleChange} />
            </div>
            <div className="ui-group">
              <label>Concerne Vol Immatriculation</label>
              <input type="text" name="immatriculation" required onChange={handleChange} placeholder="Ex: EZS1234" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2 className="card-title">Gate (Défilement des gates)</h2>
          <div className="gate-carousel">
            {gates.map(gate => (
              <button
                key={gate}
                type="button"
                className={`gate-chip ${formData.gate === gate ? 'selected' : ''}`}
                onClick={() => handleGateSelect(gate)}
              >
                {gate}
              </button>
            ))}
          </div>
          <input type="hidden" name="gate" value={formData.gate} required />
        </div>

        <div className="form-card">
          <div className="grid-2">
            <div className="ui-group">
              <label>Nombre de Bus</label>
              <input type="number" name="nombre_bus" onChange={handleChange} placeholder="0" />
            </div>
            <div className="ui-group">
              <label>Nombre de passagers</label>
              <input type="number" name="nombre_clients" onChange={handleChange} placeholder="0" />
            </div>
          </div>
        </div>

        <div className="form-card">
          <h2 className="card-title">Déroulement</h2>
          
          <div className="ui-group">
            <label>Heure TOBT</label>
            <input type="time" name="heure_tobt" onChange={handleChange} className="time-picker" />
          </div>

          <div className="ui-group">
            <label>Heure arrivée agent Swissport</label>
            <input type="time" name="heure_arrivee_agent" onChange={handleChange} className="time-picker" />
          </div>
          
          {renderOuiNon('speedy_boarding', 'Échange avec le chauffeur pour les speedy-boarding')}
          {renderOuiNon('bon_deroulement', 'Bon déroulement')}
          
          <div className="ui-group">
            <label>Début chargement</label>
            <input type="time" name="debut_chargement" onChange={handleChange} className="time-picker" />
          </div>
          
          {renderOuiNon('contact_radio', 'Contacte avec radio à l’avion avant départ premier bus')}
          
          {renderOuiNon('probleme_avion', 'Problème à l’avion')}
          {formData.probleme_avion === true && (
            <div className="ui-group animate-in sub-input">
              <label>Case remarque (Problème)</label>
              <input type="text" name="remarque_probleme" onChange={handleChange} placeholder="Précisez le problème..." />
            </div>
          )}

          <div className="ui-group">
            <label>Départ premier bus heure</label>
            <input type="time" name="depart_premier_bus" onChange={handleChange} className="time-picker" />
          </div>

          {renderOuiNon('attente_avion', 'Attente à l’avion')}
          {formData.attente_avion === true && (
            <div className="ui-group animate-in sub-input">
              <label>Temps d'attente (décompte minutes)</label>
              <input type="number" name="temps_attente_min" onChange={handleChange} placeholder="5" />
            </div>
          )}

          {renderOuiNon('plm', 'Plm')}
          {renderOuiNon('retard_depart', 'Retard Départ heure avion')}
          {renderOuiNon('ir_87', 'IR 87')}
          
          <div className="ui-group mt-4">
            <label>Case remarque</label>
            <textarea name="remarque_globale" rows="3" onChange={handleChange} placeholder="Ajouter une remarque..."></textarea>
          </div>
        </div>

        <div className="action-bar">
          <button type="submit" disabled={loading || !formData.gate} className="btn-primary main-submit">
            {loading ? 'Envoi en cours...' : 'Valider'}
          </button>
        </div>

      </form>
    </>
  );
}