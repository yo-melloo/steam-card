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
  
  const totalPlaytimeMinutes = games.reduce((acc, game) => acc + (game.playtimeForever || 0), 0);
  const totalPlaytimeHours = Math.round(totalPlaytimeMinutes / 60);

  // Jogo mais jogado
  const topGame = games.length > 0 
    ? [...games].sort((a, b) => (b.playtimeForever || 0) - (a.playtimeForever || 0))[0]
    : null;

  const topGameHours = topGame ? Math.round(topGame.playtimeForever / 60) : 0;

  // Filtrar e ordenar jogos
  const filteredAndSortedGames = games
    .filter((game) => {
      // Busca por nome
      const matchesName = game.name?.toLowerCase().includes(searchGame.toLowerCase());
      
      // Filtros de Playtime
      if (filterPlayed === 'played') {
        return matchesName && (game.playtimeForever || 0) > 0;
      }
      if (filterPlayed === 'unplayed') {
        return matchesName && (game.playtimeForever || 0) === 0;
      }
      return matchesName;
    })
    .sort((a, b) => {
      if (sortBy === 'playtime-desc') {
        return (b.playtimeForever || 0) - (a.playtimeForever || 0);
      }
      if (sortBy === 'playtime-asc') {
        return (a.playtimeForever || 0) - (b.playtimeForever || 0);
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      if (sortBy === 'recent') {
        return (b.rtimeLastPlayed || 0) - (a.rtimeLastPlayed || 0);
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
    <main className="container">
      <header>
        <h1 className="logo-title">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" style={{ verticalAlign: 'middle', color: '#66c0f4' }}>
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.284 3.417 9.773 8.163 11.353l2.873-4.043c-.205-.145-.37-.34-.475-.572l-3.328-1.411c-.722.56-1.748.45-2.34-.275-.59-.724-.486-1.79.232-2.392.718-.6 1.74-.46 2.33.264l1.392 3.43c.125.132.22.29.278.461l4.084-2.88c.046-.013.087-.03.133-.046l1.378-5.918c-.46-.35-.788-.865-.898-1.463-.195-1.055.45-2.096 1.442-2.337 1.053-.2 2.062.477 2.257 1.53.195 1.054-.45 2.097-1.442 2.338-.266.06-.525.064-.766.023l-1.39 5.96c-.035.152-.102.29-.195.407l-2.83 4.092c3.96-.34 7.234-3.076 8.358-6.72 1.487.653 3.19.167 4.108-1.163 1.157-1.68.793-4.04-.812-5.263-1.606-1.22-3.864-.836-5.02 1.25-.098.14-.176.29-.246.443zm1.186 16.5c0-.663.538-1.2 1.2-1.2s1.2.537 1.2 1.2-.538 1.2-1.2 1.2-1.2-.537-1.2-1.2zm6.273-7.534c-.812-1.127-.614-2.707.44-3.513 1.055-.806 2.535-.61 3.348.518.812 1.127.614 2.707-.44 3.513-1.055.806-2.535.61-3.348-.518z" />
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
                <span className="stat-value-sub">{topGameHours.toLocaleString('pt-BR')} horas jogadas</span>
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
                <div key={game.appid} className="game-card">
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
                          {Math.round((game.playtimeForever || 0) / 60)}h
                        </span>
                      </div>
                      <div className="game-last-played">
                        <span className="label">Última Vez</span>
                        <span className="value">
                          {formatDate(game.rtimeLastPlayed)}
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
  );
}
