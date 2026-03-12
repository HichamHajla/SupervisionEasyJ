import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

export default function Historique() {
  const [fiches, setFiches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiche, setSelectedFiche] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');

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

  useEffect(() => {
    fetchFiches();
  }, []);

  // 1. On "mémorise" la fonction avec useCallback pour satisfaire React
  const getAvailableMonths = useCallback(() => {
    const months = new Set();
    fiches.forEach(f => {
      const d = new Date(f.date_vol);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthStr);
    });
    return Array.from(months).sort().reverse();
  }, [fiches]);

  // 2. On ajoute getAvailableMonths dans la liste des dépendances (le tableau à la fin)
  useEffect(() => {
    if (fiches.length > 0 && !currentMonth) {
      const months = getAvailableMonths();
      if (months.length > 0) {
        setCurrentMonth(months[0]);
      }
    }
  }, [fiches, currentMonth, getAvailableMonths]);


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
        setFiches(fiches.filter(fiche => fiche.id !== id));
        setSelectedFiche(null);
      }
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    return timeString.substring(0, 5); 
  };

  const formatMonthYear = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase();
  };

  const getFichesForCurrentMonth = () => {
    return fiches.filter(f => {
      const d = new Date(f.date_vol);
      const fMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return fMonth === currentMonth;
    });
  };

  const groupFichesByDate = (fichesToGroup) => {
    return fichesToGroup.reduce((groups, fiche) => {
      const date = fiche.date_vol;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(fiche);
      return groups;
    }, {});
  };

  const formatDateHeader = (dateString) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('fr-FR', options).toUpperCase();
  };

  const renderFicheBoolean = (name, value) => {
    if (value === null || value === undefined) return "-";

    let ouiClass = 'doc-badge-oui'; 
    let nonClass = 'doc-badge-non'; 

    if (['probleme_avion', 'retard_depart', 'ir_87'].includes(name)) {
      ouiClass = 'doc-badge-non'; 
      nonClass = 'doc-badge-oui'; 
    } 
    else if (['attente_avion', 'PLM'].includes(name)) {
      ouiClass = 'doc-badge-warning'; 
      nonClass = 'doc-badge-oui';     
    }

    if (value === true) return <span className={ouiClass}>OUI</span>;
    if (value === false) return <span className={nonClass}>NON</span>;
    return "-";
  };

  const renderPagination = (positionClass = "") => {
    const availableMonths = getAvailableMonths();
    if (availableMonths.length === 0) return null;

    const currentIndex = availableMonths.indexOf(currentMonth);
    const hasOlder = currentIndex < availableMonths.length - 1; 
    const hasNewer = currentIndex > 0; 

    return (
      <div className={`month-pagination hide-on-print ${positionClass}`}>
        <button 
          className="nav-btn" 
          disabled={!hasOlder} 
          onClick={() => setCurrentMonth(availableMonths[currentIndex + 1])}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          <span className="nav-btn-text">Mois précédent</span>
        </button>
        
        <div className="month-display">
          {formatMonthYear(currentMonth)}
        </div>

        <button 
          className="nav-btn" 
          disabled={!hasNewer} 
          onClick={() => setCurrentMonth(availableMonths[currentIndex - 1])}
        >
          <span className="nav-btn-text">Mois suivant</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-state">Chargement de l'historique...</div>;
  }

  const fichesToShow = getFichesForCurrentMonth();
  const groupedFiches = groupFichesByDate(fichesToShow);

  return (
    <>
      <h2 className="historique-title hide-on-print">Supervisions Récentes</h2>
      
      {fiches.length === 0 ? (
        <p className="empty-state hide-on-print">Aucune fiche validée pour le moment.</p>
      ) : (
        <div className="historique-wrapper">
          
          {renderPagination()}

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
                        {fiche.ir_87 === true && <span className="alert-badge danger">IR 87</span>}
                        {fiche.retard_depart === true && <span className="alert-badge danger">Retard Départ</span>}
                        {fiche.probleme_avion === true && <span className="alert-badge danger">Problème Avion</span>}
                        {fiche.plm === true && <span className="alert-badge warning">PLM</span>}
                        {fiche.bon_deroulement === false && <span className="alert-badge warning">Mauvais déroulement</span>}
                        {fiche.attente_avion === true && <span className="alert-badge warning">Attente ({fiche.temps_attente_min}m)</span>}
                        {fiche.bon_deroulement === true && <span className="alert-badge success">Bon déroulement</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {fichesToShow.length > 3 && renderPagination("bottom")}
          
        </div>
      )}

      {selectedFiche && (
        <div className="modal-overlay" onClick={() => setSelectedFiche(null)}>
          
          <div className="modal-actions hide-on-print" onClick={(e) => e.stopPropagation()}>
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
                {renderFicheBoolean('speedy_boarding', selectedFiche.speedy_boarding)}
              </div>
              <div className="doc-check-row">
                <span>Contact Radio Avion :</span>
                {renderFicheBoolean('contact_radio', selectedFiche.contact_radio)}
              </div>
              <div className="doc-check-row">
                <span>Bon déroulement :</span>
                {renderFicheBoolean('bon_deroulement', selectedFiche.bon_deroulement)}
              </div>
              <div className="doc-check-row">
                <span>PLM :</span>
                {renderFicheBoolean('PLM', selectedFiche.plm)}
              </div>
              <div className="doc-check-row">
                <span>Retard Départ Avion :</span>
                {renderFicheBoolean('retard_depart', selectedFiche.retard_depart)}
              </div>
              <div className="doc-check-row">
                <span>Attente Avion {selectedFiche.attente_avion ? `(${selectedFiche.temps_attente_min || 0} min)` : ''} :</span>
                {renderFicheBoolean('attente_avion', selectedFiche.attente_avion)}
              </div>
            </div>

            <div className="doc-section-title">ALÉAS & REMARQUES</div>
            <div className="doc-grid-1">
              <div className="doc-check-row alert-row">
                <span>Problème Avion : {renderFicheBoolean('probleme_avion', selectedFiche.probleme_avion)}</span>
                <span>IR 87 : {renderFicheBoolean('ir_87', selectedFiche.ir_87)}</span>
              </div>

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