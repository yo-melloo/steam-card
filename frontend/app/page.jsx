"use client";

import { useState, useEffect } from 'react';

export default function Home() {
  const [steamId, setSteamId] = useState('ouro-negro');
  const [searchId, setSearchId] = useState('ouro-negro');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros e Ordenação
  const [searchGame, setSearchGame] = useState('');
  const [sortBy, setSortBy] = useState('playtime-desc');
  const [filterPlayed, setFilterPlayed] = useState('all');

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
        throw new Error('Não foi possível obter os dados da Steam. Certifique-se de que o backend está rodando (via Docker Compose ou localmente) e que o SteamID/Usuário é válido.');
      }
      const json = await response.json();
      if (json.error) {
        throw new Error(json.error);
      }
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao conectar ao servidor.');
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

  // Cálculos de Estatísticas
  const games = data?.games || [];
  const totalGames = data?.game_count || 0;
  
  // Usando snake_case correto recebido da API da Steam
  const totalPlaytimeMinutes = games.reduce((acc, game) => acc + (game.playtime_forever || 0), 0);
  const totalPlaytimeHours = Math.round(totalPlaytimeMinutes / 60);

  // Jogo mais jogado
  const topGame = games.length > 0 
    ? [...games].sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))[0]
    : null;

  const topGameHours = topGame ? Math.round(topGame.playtime_forever / 60) : 0;

  // Filtrar e ordenar jogos
  const filteredAndSortedGames = games
    .filter((game) => {
      // Busca por nome
      const matchesName = game.name?.toLowerCase().includes(searchGame.toLowerCase());
      
      // Filtros de Playtime
      if (filterPlayed === 'played') {
        return matchesName && (game.playtime_forever || 0) > 0;
      }
      if (filterPlayed === 'unplayed') {
        return matchesName && (game.playtime_forever || 0) === 0;
      }
      return matchesName;
    })
    .sort((a, b) => {
      if (sortBy === 'playtime-desc') {
        return (b.playtime_forever || 0) - (a.playtime_forever || 0);
      }
      if (sortBy === 'playtime-asc') {
        return (a.playtime_forever || 0) - (b.playtime_forever || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'recent') {
        return (b.rtime_last_played || 0) - (a.rtime_last_played || 0);
      }
      return 0;
    });

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
        <header>
          <h1 className="logo-title">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', color: '#66c0f4' }}>
              <title>Steam Logo</title>
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
            </svg>
            Steam Library Card
          </h1>
          <p className="subtitle">Compartilhe sua biblioteca de jogos Steam de forma interativa e visual</p>
        </header>

        {/* Input de Busca do SteamID */}
        <form onSubmit={handleSearchSubmit} className="search-container">
          <input 
            type="text" 
            placeholder="Digite o SteamID, Usuário ou Link do Perfil (ex: ouro-negro)"
            className="search-input"
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
          />
          <button type="submit" className="search-button">
            Visualizar
          </button>
        </form>

        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Carregando biblioteca de jogos...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <h3 className="error-title">Erro ao carregar</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        {!loading && !error && data && (
          <>
            {/* Card com Detalhes do Jogador */}
            <div className="profile-card">
              <div className="profile-info">
                <div className="avatar-container">
                  <img 
                    src={data.player?.avatarfull || data.player?.avatar || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg'} 
                    alt="Avatar" 
                    className="avatar" 
                  />
                  <span className={`status-badge ${data.player?.personastate > 0 ? 'online' : 'offline'}`}></span>
                </div>
                <div className="profile-details">
                  <h2>{data.player?.personaname || 'Usuário Steam'}</h2>
                  <a 
                    href={data.player?.profileurl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="profile-link"
                  >
                    Ver perfil na Steam 
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                      <polyline points="15 3 21 3 21 9"></polyline>
                      <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Painel de Estatísticas */}
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Total de Jogos</span>
                  <span className="stat-value">{totalGames}</span>
                  <span className="stat-value-sub">na biblioteca</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Tempo Total</span>
                  <span className="stat-value">{totalPlaytimeHours.toLocaleString('pt-BR')}h</span>
                  <span className="stat-value-sub">de jogo acumuladas</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Em Destaque</span>
                  <span className="stat-value" style={{ fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }} title={topGame?.name}>
                    {topGame?.name || 'Nenhum'}
                  </span>
                  <div className="stat-value-sub">
                    <span>{topGameHours.toLocaleString('pt-BR')}h jogadas</span>
                    {data.top_game_achievements && (
                      <div className="top-game-achievements-badge" title={`Conquistas no jogo ${data.top_game_achievements.game_name}`}>
                        🏆 Conquistas: {data.top_game_achievements.unlocked}/{data.top_game_achievements.total} ({data.top_game_achievements.percentage}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de Filtro e Busca */}
            <div className="controls-container">
              <div className="filter-group">
                <span className="filter-label">Ordenar:</span>
                <select 
                  className="select-control"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="playtime-desc">Mais jogados</option>
                  <option value="playtime-asc">Menos jogados</option>
                  <option value="name-asc">Nome (A-Z)</option>
                  <option value="name-desc">Nome (Z-A)</option>
                  <option value="recent">Jogados recentemente</option>
                </select>

                <span className="filter-label" style={{ marginLeft: '12px' }}>Filtro:</span>
                <select 
                  className="select-control"
                  value={filterPlayed}
                  onChange={(e) => setFilterPlayed(e.target.value)}
                >
                  <option value="all">Todos os jogos</option>
                  <option value="played">Apenas jogados</option>
                  <option value="unplayed">Nunca jogados</option>
                </select>
              </div>

              <input 
                type="text"
                placeholder="Buscar jogo na biblioteca..."
                className="input-search-games"
                value={searchGame}
                onChange={(e) => setSearchGame(e.target.value)}
              />
            </div>

            {/* Grid de Jogos */}
            {filteredAndSortedGames.length > 0 ? (
              <div className="games-grid">
                {filteredAndSortedGames.map((game) => (
                  <div 
                    key={game.appid} 
                    className="game-card"
                    onClick={() => setSelectedGame(game)}
                    onMouseEnter={() => setHoveredGameBanner(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`)}
                    onMouseLeave={() => setHoveredGameBanner(null)}
                  >
                    <div className="game-banner-container">
                      <img 
                        src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                        alt={game.name}
                        className="game-banner"
                        onError={(e) => {
                          // Imagem reserva caso falhe
                          e.target.src = 'https://shared.fastly.steamstatic.com/store_images/api/missing_store_header_vertical.png';
                        }}
                      />
                    </div>
                    <div className="game-content">
                      <h3 className="game-title" title={game.name}>{game.name}</h3>
                      <div className="game-stats">
                        <div className="game-playtime">
                          <span className="label">Tempo Jogado</span>
                          <span className="value">
                            {Math.round((game.playtime_forever || 0) / 60)}h
                          </span>
                        </div>
                        <div className="game-last-played">
                          <span className="label">Última Vez</span>
                          <span className="value">
                            {formatDate(game.rtime_last_played)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--steam-text-muted)', fontSize: '1.1rem' }}>
                Nenhum jogo encontrado com os filtros selecionados.
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal Overlay Centralizado e Responsivo */}
      {selectedGame && (
        <div className="modal-overlay" onClick={() => setSelectedGame(null)}>
          <div className="game-modal-content" onClick={(e) => e.stopPropagation()}>
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
                
                {/* Tempo recente se disponível */}
                {selectedGame.playtime_2weeks && (
                  <div className="modal-stat-item highlight">
                    <span className="label">Jogado Recentemente (2 Semanas)</span>
                    <span className="value">
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
