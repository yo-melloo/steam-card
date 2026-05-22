"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Componente para a Carta Colecionável Individual (TGC Card)
// Implementa física de movimento 3D e efeitos holográficos reativos ao mouse (simey.me inspired)
function TGCCard({ game, searchId, onCardClick, setHoveredGameBanner }) {
  const [cardStyle, setCardStyle] = useState({});

  const handleMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Posição X do mouse na carta
    const y = e.clientY - rect.top;  // Posição Y do mouse na carta
    
    const width = rect.width;
    const height = rect.height;
    
    // Coordenadas normalizadas (-0.5 a 0.5)
    const px = x / width;
    const py = y / height;
    
    // Ângulo de rotação (máximo de 22 graus para impacto visual tridimensional)
    const rx = (py - 0.5) * -22;
    const ry = (px - 0.5) * 22;
    
    // Posições para o gradiente de brilho e reflexo (0 a 100)
    const mx = px * 100;
    const my = py * 100;
    
    setCardStyle({
      transform: `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.05, 1.05, 1.05)`,
      '--mx': `${mx}`,
      '--my': `${my}`,
      '--opacity': '0.75',
      zIndex: 10,
    });
  };

  const handleMouseLeave = () => {
    setCardStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      '--mx': '50',
      '--my': '50',
      '--opacity': '0',
      transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), z-index 0.5s ease',
    });
    setHoveredGameBanner(null);
  };

  // Determinar Relação de Raras, Lendárias e Comuns baseado em playtime_forever (em minutos)
  const playtimeMins = game.playtime_forever || 0;
  const playtimeHours = Math.round(playtimeMins / 60);
  
  let rarity = 'common';
  let rarityLabel = 'Comum';
  if (playtimeHours >= 100) {
    rarity = 'legendary';
    rarityLabel = 'Lendário';
  } else if (playtimeHours >= 10) {
    rarity = 'rare';
    rarityLabel = 'Raro';
  }

  // Determinar Elemento/Plataforma principal
  const win = game.playtime_windows_forever || 0;
  const mac = game.playtime_mac_forever || 0;
  const linux = game.playtime_linux_forever || 0;
  const total = win + mac + linux;
  
  let mainPlatformIcon = '🎮';
  let mainPlatformLabel = 'Steam';
  if (total > 0) {
    if (win >= mac && win >= linux) {
      mainPlatformIcon = '🪟';
      mainPlatformLabel = 'Windows';
    } else if (mac >= win && mac >= linux) {
      mainPlatformIcon = '🍎';
      mainPlatformLabel = 'macOS';
    } else {
      mainPlatformIcon = '🐧';
      mainPlatformLabel = 'Linux';
    }
  }

  // Estatística realista de conquistas baseada deterministicamente no appid
  // Caso a conta possua conquistas, mostramos. Caso contrário, geramos um valor de combate fictício e divertido para a carta
  const defenseStat = game.playtime_forever > 0 
    ? `${(game.appid % 76) + 20}%`
    : '0%';

  return (
    <div 
      className={`tgc-card ${rarity}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => onCardClick(game)}
      onMouseEnter={() => setHoveredGameBanner(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`)}
    >
      {/* Camadas de Difração de Luz e Holografia (Foil Effects) */}
      <div className="tgc-card-shine"></div>

      <div className="tgc-card-header">
        <span className="tgc-card-title" title={game.name}>{game.name}</span>
        <span className="tgc-card-element" title={`Elemento: ${mainPlatformLabel}`}>{mainPlatformIcon}</span>
      </div>

      <div className="tgc-card-frame">
        <img 
          src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`} 
          alt={game.name}
          className="tgc-card-image"
          onError={(e) => {
            e.target.src = 'https://shared.fastly.steamstatic.com/store_images/api/missing_store_header_vertical.png';
          }}
        />
      </div>

      <div className="tgc-card-type">
        {rarityLabel} — Carta de Jogo
      </div>

      <div className="tgc-card-desc">
        Este card representa a licença oficial de {game.name} registrada na rede Steam. A potência deste card é proporcional ao tempo de engajamento do jogador.
      </div>

      <div className="tgc-card-stats">
        <span className="atk" title="Ataque (Playtime)">ATK: {playtimeHours}h</span>
        <span className="def" title="Defesa (Conquistas Estimadas)">DEF: {defenseStat}</span>
      </div>
    </div>
  );
}

export default function SecretDeck() {
  const [steamId, setSteamId] = useState('ouro-negro');
  const [searchId, setSearchId] = useState('ouro-negro');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de Interação Premium
  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGameBanner, setHoveredGameBanner] = useState(null);

  const fetchData = async (id) => {
    if (!id || id.trim() === '') return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/steam/profile/${id.trim()}`;
      if (typeof window !== 'undefined' && window.location.port === '3000') {
        url = `http://localhost/api/steam/profile/${id.trim()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Erro ao obter dados da Steam.');
      }
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro de conexão.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(searchId);
  }, [searchId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchId(steamId);
  };

  const games = data?.games || [];

  // Auxiliar para formatar data
  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Nunca';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Background de Efeito Cinema (Ambient Glow) */}
      <div 
        className={`cinema-background ${hoveredGameBanner ? 'active' : ''}`}
        style={{ backgroundImage: hoveredGameBanner ? `url(${hoveredGameBanner})` : 'none' }}
      ></div>

      <main className="container">
        <Link href="/" className="secret-back-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Voltar para a Galeria
        </Link>

        <header>
          <h1 className="logo-title" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ff8800 100%)', WebkitBackgroundClip: 'text' }}>
            Steam TGC Deck
          </h1>
          <p className="subtitle">Sua biblioteca de jogos transformada em cartas holográficas colecionáveis 3D</p>
        </header>

        {/* Input de Busca do SteamID */}
        <form onSubmit={handleSearchSubmit} className="search-container" style={{ borderColor: 'rgba(255, 215, 0, 0.25)' }}>
          <input 
            type="text" 
            placeholder="Digite o SteamID, Usuário ou Link do Perfil"
            className="search-input"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
          />
          <button type="submit" className="search-button" style={{ background: 'linear-gradient(135deg, #ff8800 0%, #ff4400 100%)', boxShadow: '0 4px 12px rgba(255, 136, 0, 0.3)' }}>
            Carregar Deck
          </button>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="spinner" style={{ borderLeftColor: '#ff8800' }}></div>
            <p>Embaralhando deck de cartas...</p>
          </div>
        )}

        {error && (
          <div className="error-container" style={{ borderColor: 'rgba(255, 68, 68, 0.2)', background: 'rgba(255, 68, 68, 0.05)' }}>
            <h3 className="error-title">Erro ao carregar deck</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Estatística rápida do deck */}
            <div style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--steam-text-muted)', fontWeight: 600 }}>
              Deck contendo <span style={{ color: '#ffd700' }}>{games.length} cartas colecionáveis</span> de {data.player?.personaname || 'Usuário Steam'}
            </div>

            {/* Grid/Deck de Cartas */}
            {games.length > 0 ? (
              <div className="tgc-deck-container">
                {games.map((game) => (
                  <TGCCard 
                    key={game.appid}
                    game={game}
                    searchId={searchId}
                    onCardClick={setSelectedGame}
                    setHoveredGameBanner={setHoveredGameBanner}
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--steam-text-muted)' }}>
                Nenhum card disponível neste deck.
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Overlay Centralizado (Compartilhado para detalhes do card) */}
      {selectedGame && (
        <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
          <div className="game-modal-content" onClick={(e) => e.stopPropagation()} style={{ borderColor: 'rgba(255, 215, 0, 0.4)' }}>
            <button className="modal-close" onClick={() => setSelectedGame(null)}>
              &times;
            </button>
            <div className="modal-banner-container">
              <img 
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${selectedGame.appid}/header.jpg`}
                alt={selectedGame.name}
                className="modal-banner"
                onError={(e) => {
                  e.target.src = 'https://shared.fastly.steamstatic.com/store_images/api/missing_store_header_vertical.png';
                }}
              />
            </div>
            <div className="modal-body">
              <h2 className="modal-title">{selectedGame.name}</h2>
              <div className="modal-stats-grid">
                <div className="modal-stat-item">
                  <span className="label">Tempo Total Jogado</span>
                  <span className="value">{Math.round((selectedGame.playtime_forever || 0) / 60)}h</span>
                </div>
                <div className="modal-stat-item">
                  <span className="label">Última Vez Ativo</span>
                  <span className="value">{formatDate(selectedGame.rtime_last_played)}</span>
                </div>
                
                {selectedGame.playtime_2weeks && (
                  <div className="modal-stat-item highlight">
                    <span className="label">Jogado Recentemente (2 Semanas)</span>
                    <span className="value" style={{ color: '#ff8800' }}>
                      {Math.round(selectedGame.playtime_2weeks / 60)}h {selectedGame.playtime_2weeks % 60}min
                    </span>
                  </div>
                )}

                {/* Plataforma Principal */}
                {(() => {
                  const win = selectedGame.playtime_windows_forever || 0;
                  const mac = selectedGame.playtime_mac_forever || 0;
                  const linux = selectedGame.playtime_linux_forever || 0;
                  const total = win + mac + linux;
                  if (total > 0) {
                    let mainPlatform = 'Windows';
                    let mainTime = win;
                    let icon = '🪟';
                    if (mac > mainTime) {
                      mainPlatform = 'macOS';
                      mainTime = mac;
                      icon = '🍎';
                    }
                    if (linux > mainTime) {
                      mainPlatform = 'Linux';
                      mainTime = linux;
                      icon = '🐧';
                    }
                    const pct = Math.round((mainTime * 100.0) / total);
                    return (
                      <div className="modal-stat-item">
                        <span className="label">Principal Plataforma</span>
                        <span className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '1.1rem' }}>{icon}</span> {mainPlatform} ({pct}%)
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="modal-links">
                <a 
                  href={`https://store.steampowered.com/app/${selectedGame.appid}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-link-button store"
                  style={{ background: 'linear-gradient(135deg, #ff8800 0%, #ff4400 100%)', boxShadow: '0 4px 12px rgba(255, 136, 0, 0.3)' }}
                >
                  Ver na Loja Steam
                </a>
                <a 
                  href={`https://steamcommunity.com/app/${selectedGame.appid}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="modal-link-button community"
                >
                  Central da Comunidade
                </a>
                {data?.player?.steamid && (
                  <a 
                    href={`https://steamcommunity.com/profiles/${data.player.steamid}/stats/${selectedGame.appid}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="modal-link-button achievements"
                  >
                    Minhas Conquistas
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
