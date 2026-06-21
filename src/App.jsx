import { useState, useEffect } from 'react';

import { CATEGORIES_CLUSTERED, CATEGORY_ICONS } from './categories';

const CATEGORIES = {};
Object.keys(CATEGORIES_CLUSTERED).forEach(cat => {
  CATEGORIES[cat] = CATEGORIES_CLUSTERED[cat].flat();
});

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function useStickyState(defaultValue, key) {
  const [value, setValue] = useState(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch {
      return defaultValue;
    }
  });
  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}


function App() {
  const [gameState, setGameState] = useStickyState('setup', 'imp_state');
  const [numPlayers, setNumPlayers] = useStickyState(5, 'imp_players');
  const [numImpostors, setNumImpostors] = useStickyState(1, 'imp_impostors');
  const [selectedCategories, setSelectedCategories] = useStickyState(["Animales"], 'imp_categories_list');
  const [activeCategory, setActiveCategory] = useStickyState("", 'imp_active_cat');
  const [gameMode, setGameMode] = useStickyState('clasico', 'imp_gamemode');
  
  const [roles, setRoles] = useStickyState([], 'imp_roles');
  const [currentPlayer, setCurrentPlayer] = useStickyState(0, 'imp_curr_player');
  const [revealed, setRevealed] = useStickyState(false, 'imp_revealed');
  const [voteTarget, setVoteTarget] = useStickyState(null, 'imp_vote_target');
  
  const [timeLeft, setTimeLeft] = useStickyState(300, 'imp_time');

  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft]);

  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.log("Wake Lock error:", err);
      }
    };
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };
    
    requestWakeLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLock !== null) {
        wakeLock.release().catch(() => {});
      }
    };
  }, []);

  const startGame = () => {
    if (selectedCategories.length === 0) return;
    
    let pool = selectedCategories;
    if (pool.includes("Al Azar")) {
      pool = Object.keys(CATEGORIES);
    }
    const pickedCategory = pool[Math.floor(Math.random() * pool.length)];
    const words = CATEGORIES[pickedCategory];
    const secretWord = words[Math.floor(Math.random() * words.length)];
    
    let subGroup = [];
    const clustered = CATEGORIES_CLUSTERED[pickedCategory];
    if (clustered) {
      for (const group of clustered) {
        if (group.includes(secretWord)) {
          subGroup = group;
          break;
        }
      }
    }
    
    let similarWords = subGroup.filter(w => w !== secretWord);
    if (similarWords.length === 0) {
      similarWords = words.filter(w => w !== secretWord);
    }
    similarWords = shuffle(similarWords);
    
    let newRoles = [];
    
    if (gameMode === 'doble') {
      let otherWords = shuffle(words.filter(w => w !== secretWord));
      for (let i = 0; i < numPlayers - numImpostors; i++) {
        const fakeWord = otherWords[i % otherWords.length] || "Otra";
        const w1 = Math.random() > 0.5 ? secretWord : fakeWord;
        const w2 = w1 === secretWord ? fakeWord : secretWord;
        newRoles.push(`${w1}  — O —  ${w2}`);
      }
    } else if (gameMode === 'despistado') {
      const fakeWord = similarWords[0] || "Otra";
      let innocentsCount = numPlayers - numImpostors;
      if (innocentsCount > 1) {
        newRoles.push(fakeWord); // El despistado
        for (let i = 1; i < innocentsCount; i++) {
          newRoles.push(secretWord);
        }
      } else {
        newRoles.push(secretWord);
      }
    } else {
      for (let i = 0; i < numPlayers - numImpostors; i++) {
        newRoles.push(secretWord);
      }
    }
    
    for (let i = 0; i < numImpostors; i++) {
      newRoles.push("IMPOSTOR");
    }
    
    setRoles(shuffle(newRoles));
    setCurrentPlayer(0);
    setRevealed(false);
    setVoteTarget(null);
    setActiveCategory(pickedCategory);
    setGameState('passing');
    setTimeLeft(numPlayers * 60); // 1 minute per player
  };

  const handleRevealClick = () => {
    if (!revealed) {
      setRevealed(true);
    } else {
      setRevealed(false);
      if (currentPlayer + 1 < numPlayers) {
        setCurrentPlayer(currentPlayer + 1);
      } else {
        setGameState('playing');
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="app-container">
      {gameState === 'setup' && (
        <div className="glass-panel">
          <div>
            <h1 className="title">El Impostor</h1>
            <p className="subtitle">Descubre al infiltrado antes de que termine el tiempo</p>
          </div>

          <div className="control-group">
            <label>Jugadores</label>
            <div className="input-row">
              <button 
                className="btn-icon" 
                onClick={() => setNumPlayers(Math.max(3, numPlayers - 1))}
              >-</button>
              <span className="value-display">{numPlayers}</span>
              <button 
                className="btn-icon" 
                onClick={() => setNumPlayers(Math.min(20, numPlayers + 1))}
              >+</button>
            </div>
          </div>

          <div className="control-group">
            <label>Impostores</label>
            <div className="input-row">
              <button 
                className="btn-icon" 
                onClick={() => setNumImpostors(Math.max(1, numImpostors - 1))}
              >-</button>
              <span className="value-display">{numImpostors}</span>
              <button 
                className="btn-icon" 
                onClick={() => setNumImpostors(Math.min(Math.floor(numPlayers/2), numImpostors + 1))}
              >+</button>
            </div>
          </div>

          <div className="control-group">
            <label>Modo de Juego</label>
            <div className="mode-selector">
              <button 
                className={`mode-btn ${gameMode === 'clasico' ? 'active' : ''}`}
                onClick={() => setGameMode('clasico')}
              >Clásico</button>
              <button 
                className={`mode-btn ${gameMode === 'ciegas' ? 'active' : ''}`}
                onClick={() => setGameMode('ciegas')}
              >A Ciegas</button>
              <button 
                className={`mode-btn ${gameMode === 'doble' ? 'active' : ''}`}
                onClick={() => setGameMode('doble')}
              >Doble Palabra</button>
              <button 
                className={`mode-btn ${gameMode === 'despistado' ? 'active' : ''}`}
                onClick={() => setGameMode('despistado')}
              >Despistado</button>
            </div>
            <p className="mode-desc">
              {gameMode === 'clasico' && "1 palabra secreta. Categoría visible."}
              {gameMode === 'ciegas' && "¡La categoría no se muestra a nadie!"}
              {gameMode === 'doble' && "Los inocentes reciben 2 palabras (la común y una falsa)."}
              {gameMode === 'despistado' && "Un inocente recibe una palabra parecida, pero no la misma."}
            </p>
          </div>

          <div className="control-group">
            <label>Categorías (puedes elegir varias)</label>
            <div className="category-grid">
              {['Al Azar', ...Object.keys(CATEGORIES)].map(c => {
                const isSelected = selectedCategories.includes(c);
                return (
                  <div 
                    key={c} 
                    className={`category-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                       if (c === 'Al Azar') {
                         if (!isSelected) {
                           setSelectedCategories(['Al Azar']);
                         } else {
                           setSelectedCategories(Object.keys(CATEGORIES).slice(0, 1));
                         }
                       } else {
                         let newSel = selectedCategories.filter(sc => sc !== 'Al Azar');
                         if (isSelected && newSel.length > 1) {
                           newSel = newSel.filter(sc => sc !== c);
                         } else if (!isSelected) {
                           newSel = [...newSel, c];
                         }
                         if (newSel.length > 0) setSelectedCategories(newSel);
                       }
                    }}
                  >
                    <div className="category-icon">{c === 'Al Azar' ? '🎲' : (CATEGORY_ICONS[c] || "📦")}</div>
                    <div className="category-name">{c}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={startGame}
            disabled={selectedCategories.length === 0}
            style={{opacity: selectedCategories.length === 0 ? 0.5 : 1}}
          >
            Comenzar Juego
          </button>
        </div>
      )}

      {gameState === 'passing' && (
        <div className="player-turn-container">
          <div className="category-badge">
            <span>🏷️</span> Categoría: {gameMode === 'ciegas' ? '??? (Oculta)' : activeCategory}
          </div>
          
          <h2 className="player-name">Jugador {currentPlayer + 1}</h2>
          
          <p className="instruction-text">
            {!revealed 
              ? "Asegúrate de que nadie esté mirando tu pantalla y toca el círculo para ver tu palabra secreta." 
              : "Memoriza tu rol. Toca nuevamente para ocultarlo y pasar el dispositivo."}
          </p>

          <div 
            className={`reveal-area ${revealed ? 'revealed' : ''} ${revealed && roles[currentPlayer] === 'IMPOSTOR' ? 'impostor' : ''}`}
            onClick={handleRevealClick}
          >
            {!revealed ? (
              <span className="reveal-text">TOCAR PARA VER</span>
            ) : (
              <div className="secret-content">
                <span className="role-label">TÚ ERES</span>
                <span className={`secret-word ${roles[currentPlayer] === 'IMPOSTOR' ? 'impostor-text' : ''}`}>
                  {roles[currentPlayer]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {gameState === 'playing' && (
        <div className="glass-panel game-active-container">
          <div className="category-badge">
            <span>🏷️</span> Categoría: {gameMode === 'ciegas' ? '??? (Oculta)' : activeCategory}
          </div>
          
          <h2 className="title" style={{fontSize: '2rem'}}>¡A debatir!</h2>
          <p className="subtitle">Hagan preguntas para encontrar al impostor.</p>
          
          <div className="timer" style={{ color: timeLeft <= 60 ? 'var(--danger)' : 'white' }}>
            {formatTime(timeLeft)}
          </div>
          
          <button className="btn-primary" onClick={() => { setGameState('voting'); setVoteTarget(null); }}>
            Votar al Impostor
          </button>
          <button className="btn-secondary" onClick={() => setGameState('setup')}>
            Cancelar / Reiniciar
          </button>
        </div>
      )}

      {gameState === 'voting' && (
        <div className="glass-panel game-active-container">
          <h2 className="title" style={{fontSize: '2rem'}}>Votación</h2>
          <p className="subtitle">¿Quién creen que es el impostor?</p>

          <div className="player-list">
            {Array.from({ length: numPlayers }).map((_, i) => (
              <div 
                key={i} 
                className={`player-option ${voteTarget === i ? 'selected' : ''}`}
                onClick={() => setVoteTarget(i)}
              >
                Jugador {i + 1}
              </div>
            ))}
          </div>

          <button 
            className="btn-primary" 
            onClick={() => setGameState('results')}
            disabled={voteTarget === null}
            style={{ opacity: voteTarget === null ? 0.5 : 1 }}
          >
            Confirmar Voto
          </button>
        </div>
      )}

      {gameState === 'results' && (
        <div className="glass-panel game-active-container">
          <h2 className="title" style={{fontSize: '2rem'}}>Resultado de la Votación</h2>
          
          {roles[voteTarget] === 'IMPOSTOR' ? (
            <>
              <div className="result-message result-success">
                ¡Victoria! El Jugador {voteTarget + 1} era un Impostor.
              </div>
              
              <div style={{marginTop: '1rem', color: 'var(--text-muted)'}}>
                <p><strong>Los impostores eran:</strong></p>
                <p>
                  {roles.map((role, i) => role === 'IMPOSTOR' ? `Jugador ${i + 1}` : null).filter(Boolean).join(', ')}
                </p>
                <p style={{marginTop: '0.5rem'}}>La palabra secreta era: <strong>{roles.find(r => r !== 'IMPOSTOR')}</strong></p>
              </div>

              <button className="btn-primary" onClick={() => setGameState('setup')} style={{marginTop: '2rem'}}>
                Jugar de nuevo
              </button>
            </>
          ) : (
            <>
              <div className="result-message result-fail">
                ¡Fallaron! El Jugador {voteTarget + 1} era Inocente.
              </div>
              <p className="subtitle" style={{marginTop: '1rem', fontSize: '1.1rem', color: 'white'}}>
                El impostor sigue entre ustedes...
              </p>
              <button className="btn-primary" onClick={() => setGameState('playing')} style={{marginTop: '2rem'}}>
                Continuar jugando
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
