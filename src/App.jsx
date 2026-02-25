import { useState, useEffect } from 'react';
import Window from './Window';

function App() {
  const [registry, setRegistry] = useState([]);
  const [openWindows, setOpenWindows] = useState([]);
  const [activeWindowId, setActiveWindowId] = useState(null);

  // 1. On charge le JSON au démarrage
  useEffect(() => {
    fetch('/registry.json')
      .then(res => res.json())
      .then(data => setRegistry(data))
      .catch(err => console.error("Erreur de chargement du registry :", err));
  }, []);

  // 2. Fonction pour ouvrir une app
  const openApp = (appId) => {
    if (!openWindows.includes(appId)) {
      setOpenWindows([...openWindows, appId]);
    }
    setActiveWindowId(appId);
  };

  // 3. Fonction pour fermer une app
  const closeApp = (appId) => {
    setOpenWindows(openWindows.filter(id => id !== appId));
  };

  return (
    <div
      style={{
        backgroundColor: '#008080',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* --- LE BUREAU (AFFICHAGE DES ICÔNES) --- */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {registry.map((app) => (
          <div
            key={app.id}
            onDoubleClick={() => openApp(app.id)}
            style={{
              width: '80px',
              textAlign: 'center',
              color: 'white',
              cursor: 'pointer',
              textShadow: '1px 1px 2px black'
            }}
          >
            {/* Remplaçant temporaire d'icône */}
            <div style={{ fontSize: '40px' }}>📁</div>
            <div style={{ fontSize: '12px', marginTop: '5px' }}>{app.name}</div>
          </div>
        ))}
      </div>

      {/* --- LES FENÊTRES OUVERTES --- */}
      {openWindows.map((appId) => {
        const appData = registry.find(a => a.id === appId);
        return (
          <Window
            key={appId}
            app={appData}
            onClose={closeApp}
            onFocus={() => setActiveWindowId(appId)}
            zIndex={activeWindowId === appId ? 100 : 10}
          />
        );
      })}
      {/* --- LA BARRE DES TÂCHES --- */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '40px',
          backgroundColor: '#c0c0c0',
          borderTop: '2px solid #dfdfdf',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5px',
          zIndex: 9999, // Toujours au premier plan
          boxShadow: 'inset 0 1px 0 #fff'
        }}
      >
        {/* Bouton Démarrer */}
        <button
          style={{
            fontWeight: 'bold',
            marginRight: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span style={{ color: 'blue' }}>A</span>
          <span style={{ color: 'red' }}>M</span>
          <span style={{ color: 'green' }}>U</span>
          -OS
        </button>

        {/* Liste des applications ouvertes */}
        <div style={{ display: 'flex', gap: '5px', flexGrow: 1 }}>
          {openWindows.map(appId => {
            const appData = registry.find(a => a.id === appId);
            const isActive = activeWindowId === appId;
            return (
              <button
                key={appId}
                onClick={() => setActiveWindowId(appId)}
                style={{
                  width: '150px',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  // Effet de bouton "enfoncé" si c'est la fenêtre active
                  boxShadow: isActive ? 'inset 2px 2px 2px #000, inset -2px -2px 2px #fff' : '',
                  backgroundColor: isActive ? '#dfdfdf' : ''
                }}
              >
                {appData?.name}
              </button>
            );
          })}
        </div>

        {/* Horloge */}
        <div
          style={{
            padding: '2px 10px',
            border: '2px solid',
            borderColor: '#808080 #fff #fff #808080',
            fontSize: '12px'
          }}
        >
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>

  );
}

export default App;