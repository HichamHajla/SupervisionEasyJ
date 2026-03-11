import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';

export default function Historique() {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiche, setSelectedFiche] = useState(null);

  useEffect(() => {
    fetchFiches();
  }, []);

  const fetchFiches = async () => {
    const { data, error } = await supabase
      .from('fiches_coordination')
      .select('*')
      .order('date_vol', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erreur :", error);
    } else {
      setFiches(data);
    }
    setLoading(false);
  };

  // NOUVELLE FONCTION : SUPPRESSION DE LA FICHE
  const handleDelete = async (id) => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir supprimer cette fiche ? Cette action est irréversible.");
    
    if (confirmation) {
      const { error } = await supabase
        .from('fiches_coordination')
        .delete()
        .eq('id', id);

      if (error) {
        alert("Erreur lors de la suppression : " + error.message);
      } else {
        // Met à jour la liste affichée en retirant la fiche supprimée
        setFiches(fiches.filter(fiche => fiche.id !== id));
        // Ferme la modale
        setSelectedFiche(null);
      }
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5); 
  };

  const groupFichesByDate = () => {
    return fiches.reduce((groups, fiche) => {
      const date = fiche.date_vol;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(fiche);
      return groups;
    }, {});
  };

  const formatDateHeader = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options).toUpperCase();
  };

  const renderFicheBoolean = (value) => {
    if (value === true) return <span className="doc-badge-oui">OUI</span>;
    if (value === false) return <span className="doc-badge-non">NON</span>;
    return "-";
  };

  if (loading) {
    return <div className="loading-state">Chargement de l'historique...</div>;
  }

  const groupedFiches = groupFichesByDate();

  return (
    <>
      <h2 className="historique-title hide-on-print">Supervisions Récentes</h2>
      
      {Object.keys(groupedFiches).length === 0 ? (
        <p className="empty-state hide-on-print">Aucune fiche validée pour le moment.</p>
      ) : (
        <div className="historique-timeline hide-on-print">
          {Object.keys(groupedFiches).map((date) => (
            <div key={date} className="date-group">
              <div className="date-header">
                <h3>{formatDateHeader(date)}</h3>
                <span className="fiche-count">{groupedFiches[date].length} vol(s)</span>
              </div>

              <div className="fiches-list">
                {groupedFiches[date].map((fiche) => (
                  <div 
                    key={fiche.id} 
                    className="fiche-card premium-card"
                    onClick={() => setSelectedFiche(fiche)}
                  >
                    <div className="premium-card-top">
                      <div className="dossier-badge">N° {fiche.dossier}</div>
                      <div className="flight-immat">{fiche.immatriculation}</div>
                      <div className="airport-gate">{fiche.gate}</div>
                    </div>
                    
                    <div className="premium-card-body">
                      <div className="info-block">
                        <span className="info-label">TOBT</span>
                        <span className="info-value">{formatTime(fiche.heure_tobt)}</span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">Bus</span>
                        <span className="info-value">{fiche.nombre_bus || '-'}</span>
                      </div>
                      <div className="info-block">
                        <span className="info-label">PAX</span>
                        <span className="info-value">{fiche.nombre_clients || '-'}</span>
                      </div>
                    </div>

                    <div className="premium-card-footer">
                      {fiche.probleme_avion && <span className="alert-badge danger">Problème Avion</span>}
                      {fiche.retard_depart && <span className="alert-badge warning">Retard Départ</span>}
                      {fiche.attente_avion && <span className="alert-badge warning">Attente ({fiche.temps_attente_min}m)</span>}
                      {fiche.bon_deroulement && <span className="alert-badge success">Bon déroulement</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODALE - FORMAT FICHE A4 */}
      {selectedFiche && (
        <div className="modal-overlay" onClick={() => setSelectedFiche(null)}>
          
          <div className="modal-actions hide-on-print" onClick={(e) => e.stopPropagation()}>
            {/* NOUVEAU BOUTON SUPPRIMER */}
            <button className="delete-btn" onClick={() => handleDelete(selectedFiche.id)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              Supprimer
            </button>

            <button className="print-btn" onClick={() => window.print()}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimer
            </button>
            <button className="close-btn" onClick={() => setSelectedFiche(null)}>✕</button>
          </div>

          <div className="a4-fiche" onClick={(e) => e.stopPropagation()}>
            <div className="doc-header">
              <div className="doc-title">
                <h1>FICHE DE COORDINATION OPB</h1>
                <p>EASYJET - GREVAZ GAËL</p>
              </div>
              <div className="doc-meta">
                <strong>Date :</strong> {new Date(selectedFiche.date_vol).toLocaleDateString('fr-FR')}<br/>
                <strong>Dossier N° :</strong> {selectedFiche.dossier}
              </div>
            </div>

            <div className="doc-section-title">INFORMATIONS VOL</div>
            <div className="doc-grid-3">
              <div className="doc-box">
                <span className="box-label">Immatriculation</span>
                <span className="box-value big">{selectedFiche.immatriculation}</span>
              </div>
              <div className="doc-box">
                <span className="box-label">Gate</span>
                <span className="box-value big highlight-gate">{selectedFiche.gate}</span>
              </div>
              <div className="doc-box">
                <span className="box-label">Passagers / Bus</span>
                <span className="box-value">{selectedFiche.nombre_clients || '0'} PAX / {selectedFiche.nombre_bus || '0'} BUS</span>
              </div>
            </div>

            <div className="doc-section-title">TIMELINE OPÉRATIONNELLE</div>
            <div className="doc-tobt-container">
              <div className="doc-box tobt-box">
                <span className="box-label" style={{ fontSize: '1.2rem', color: '#000' }}><strong>TOBT</strong></span>
                <span className="box-value tobt-value">{formatTime(selectedFiche.heure_tobt)}</span>
              </div>
            </div>
            <div className="doc-grid-3">
              <div className="doc-box">
                <span className="box-label">Arrivée Swissport</span>
                <span className="box-value">{formatTime(selectedFiche.heure_arrivee_agent)}</span>
              </div>
              <div className="doc-box">
                <span className="box-label">Début chargement</span>
                <span className="box-value">{formatTime(selectedFiche.debut_chargement)}</span>
              </div>
              <div className="doc-box">
                <span className="box-label">Départ 1er Bus</span>
                <span className="box-value">{formatTime(selectedFiche.depart_premier_bus)}</span>
              </div>
            </div>

            <div className="doc-section-title">CONTRÔLE & DÉROULEMENT</div>
            <div className="doc-grid-2">
              <div className="doc-check-row">
                <span>Échange Speedy-Boarding :</span>
                {renderFicheBoolean(selectedFiche.speedy_boarding)}
              </div>
              <div className="doc-check-row">
                <span>Contact Radio Avion :</span>
                {renderFicheBoolean(selectedFiche.contact_radio)}
              </div>
              <div className="doc-check-row">
                <span>Bon déroulement :</span>
                {renderFicheBoolean(selectedFiche.bon_deroulement)}
              </div>
              <div className="doc-check-row">
                <span>PLM :</span>
                {renderFicheBoolean(selectedFiche.plm)}
              </div>
              <div className="doc-check-row">
                <span>Retard Départ Avion :</span>
                {renderFicheBoolean(selectedFiche.retard_depart)}
              </div>
              <div className="doc-check-row">
                <span>IR 87 :</span>
                {renderFicheBoolean(selectedFiche.ir_87)}
              </div>
            </div>

            <div className="doc-section-title">ALÉAS & REMARQUES</div>
            <div className="doc-grid-1">
              <div className="doc-check-row alert-row">
                <span>Problème Avion : {renderFicheBoolean(selectedFiche.probleme_avion)}</span>
                <span>Attente Avion : {renderFicheBoolean(selectedFiche.attente_avion)} {selectedFiche.attente_avion && `(${selectedFiche.temps_attente_min} min)`}</span>
              </div>
              
              {selectedFiche.probleme_avion && selectedFiche.remarque_probleme && (
                <div className="doc-remark-box">
                  <strong>Détail du problème :</strong>
                  <p>{selectedFiche.remarque_probleme}</p>
                </div>
              )}

              <div className="doc-remark-box main-remark">
                <strong>Remarque Globale :</strong>
                <p>{selectedFiche.remarque_globale || "Aucune remarque."}</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}