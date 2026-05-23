"use client";

import { useState, useEffect, useRef, useCallback } from 'react';

// SVGs Oficiais das Plataformas para a interface
const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', display: 'inline-block' }} title="Windows">
    <path d="M0 3.449L9.75 2.1v9.45H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.1zM11.25 1.899L24 0v11.55H11.25V1.899zM11.25 12.45H24v11.55l-12.75-1.9v-9.65z"/>
  </svg>
);

const MacOSIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', display: 'inline-block' }} title="macOS">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.82-.98 2.93 1.07.08 2.16-.51 2.81-1.32z"/>
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', display: 'inline-block' }} title="Linux">
    <path d="M12 2c-.67 0-1.19.06-1.57.19-.39.12-.66.31-.81.56-.16.25-.22.56-.19.94.03.37.13.79.28 1.25.31.88.75 1.94 1.09 3.06H9.19c-.37-.87-.84-1.8-1.34-2.69-.25-.44-.52-.87-.81-1.25a2.76 2.76 0 0 0-1.16-.94A2.08 2.08 0 0 0 4.81 3c-.47 0-.85.17-1.13.5-.28.34-.41.85-.41 1.5 0 .86.25 1.97.75 3.22.5 1.25 1.16 2.59 1.84 3.84A16.03 16.03 0 0 0 8 15.69V18c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.31c.78-1.16 1.5-2.41 2.16-3.63.66-1.22 1.31-2.5 1.81-3.75.5-1.25.75-2.36.75-3.22 0-.65-.13-1.16-.41-1.5-.28-.33-.66-.5-1.13-.5a2.08 2.08 0 0 0-1.07.31c-.39.22-.8.56-1.16.94-.36.38-.69.81-.97 1.25-.28.44-.59.97-.91 1.56h-2.12c.34-1.12.78-2.18 1.09-3.06.15-.46.25-.88.28-1.25.03-.38-.03-.69-.19-.94-.15-.25-.42-.44-.81-.56C13.19 2.06 12.67 2 12 2z"/>
  </svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" style={{ verticalAlign: 'middle', display: 'inline-block' }} title="Steam">
    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
  </svg>
);

// Componente TGCCard com física 3D em React Nativo (Limpa e Funcional) + Efeitos Fiéis
function TGCCard({ game, isActive, onCardClick, setHoveredGameBanner, playerSteamId }) {
  const cardRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [centerOffset, setCenterOffset] = useState({ x: 0, y: 0 });

  // Sementes para o holograma e delay aleatório da animação
  const staticStylesRef = useRef({
    '--seedx': Math.random(),
    '--seedy': Math.random(),
    '--cosmosbg': `${Math.floor(Math.random() * 734)}px ${Math.floor(Math.random() * 1280)}px`,
    'animationDelay': `${(Math.random() * -6).toFixed(2)}s`
  });

  const [description, setDescription] = useState('');
  const [descLoading, setDescLoading] = useState(false);

  const fetchDescription = useCallback(async () => {
    if (description || descLoading) return;
    setDescLoading(true);
    try {
      let url = `/api/steam/game/${game.appid}/description`;
      if (typeof window !== 'undefined' && window.location.port && window.location.port !== '80' && window.location.port !== '443') {
        url = `http://${window.location.hostname}/api/steam/game/${game.appid}/description`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setDescription(json.description);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDescLoading(false);
    }
  }, [game.appid, description, descLoading]);

  useEffect(() => {
    if (hovered || isActive) {
      fetchDescription();
    }
  }, [hovered, isActive, fetchDescription]);

  // Calculate center offset when active
  useEffect(() => {
    if (isActive && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const tx = parseFloat(cardRef.current.style.getPropertyValue('--translate-x')) || 0;
      const ty = parseFloat(cardRef.current.style.getPropertyValue('--translate-y')) || 0;
      const currentX = (rect.left - tx) + rect.width / 2;
      const currentY = (rect.top - ty) + rect.height / 2;
      const targetX = window.innerWidth / 2;
      const targetY = window.innerHeight / 2;
      setCenterOffset({ x: targetX - currentX, y: targetY - currentY });
      
      const onResize = () => {
        const tX = window.innerWidth / 2;
        const tY = window.innerHeight / 2;
        setCenterOffset({ x: tX - currentX, y: tY - currentY });
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    } else {
      setCenterOffset({ x: 0, y: 0 });
      if (cardRef.current) {
        cardRef.current.style.setProperty('--rotate-x', '0deg');
        cardRef.current.style.setProperty('--rotate-y', '0deg');
      }
    }
  }, [isActive]);

  const handleMouseMove = (e) => {
    if (isActive || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; 
    const y = e.clientY - rect.top;  
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth tilt limit to avoid rhombus
    const rotateX = ((y - centerY) / centerY) * -15; 
    const rotateY = ((x - centerX) / centerX) * 15;
    
    // Variables for the faithful CSS effects
    const pointerX = (x / rect.width) * 100;
    const pointerY = (y / rect.height) * 100;
    const px = pointerX / 100;
    const py = pointerY / 100;
    const pfc = Math.min(Math.sqrt(Math.pow(px - 0.5, 2) + Math.pow(py - 0.5, 2)) * 2, 1);
    
    const el = cardRef.current;
    el.style.setProperty('--rotate-x', `${rotateX}deg`);
    el.style.setProperty('--rotate-y', `${rotateY}deg`);
    el.style.setProperty('--pointer-x', `${pointerX}%`);
    el.style.setProperty('--pointer-y', `${pointerY}%`);
    el.style.setProperty('--pointer-from-center', pfc);
    el.style.setProperty('--pointer-from-left', px);
    el.style.setProperty('--pointer-from-top', py);
    el.style.setProperty('--card-opacity', 1);
    el.style.setProperty('--background-x', `${37 + (px * (63 - 37))}%`);
    el.style.setProperty('--background-y', `${33 + (py * (67 - 33))}%`);
  };

  const handleMouseEnter = () => {
    if (isActive) return;
    setHovered(true);
    setHoveredGameBanner(`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`);
  };

  const handleMouseLeave = () => {
    if (isActive) return;
    setHovered(false);
    if (cardRef.current) {
      const el = cardRef.current;
      el.style.setProperty('--rotate-x', '0deg');
      el.style.setProperty('--rotate-y', '0deg');
      el.style.setProperty('--pointer-x', '50%');
      el.style.setProperty('--pointer-y', '50%');
      el.style.setProperty('--card-opacity', 0);
      el.style.setProperty('--pointer-from-center', 0);
      el.style.setProperty('--pointer-from-left', 0.5);
      el.style.setProperty('--pointer-from-top', 0.5);
      el.style.setProperty('--background-x', '50%');
      el.style.setProperty('--background-y', '50%');
    }
    setHoveredGameBanner(null);
  };

  const handleCardClick = (e) => {
    e.stopPropagation();
    onCardClick(isActive ? null : game);
  };

  // Metadados do Jogo
  const playtimeHours = Math.round((game.playtime_forever || 0) / 60);
  
  // Mapear raridades aos estilos
  const rarity = playtimeHours >= 120 ? 'legendary' : playtimeHours >= 15 ? 'rare' : 'common';
  const rarityLabel = rarity === 'legendary' ? 'Lendário' : rarity === 'rare' ? 'Raro' : 'Comum';

  // Configuração das plataformas
  const win = game.playtime_windows_forever || 0;
  const mac = game.playtime_mac_forever    || 0;
  const lnx = game.playtime_linux_forever  || 0;
  const tot = win + mac + lnx;
  let platformIcon  = <SteamIcon />;
  let platformLabel = 'Steam';
  let platformType  = 'darkness'; // default element type
  if (tot > 0) {
    if (win >= mac && win >= lnx) { platformIcon = <WindowsIcon />; platformLabel = 'Windows'; platformType = 'water'; }
    else if (mac >= lnx)          { platformIcon = <MacOSIcon />;   platformLabel = 'macOS';   platformType = 'colorless'; }
    else                          { platformIcon = <LinuxIcon />;   platformLabel = 'Linux';   platformType = 'grass'; }
  }

  const defenseStat = game.playtime_forever > 0 ? `${(game.appid % 76) + 20}%` : '0%';
  const FALLBACK_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='460' height='215' viewBox='0 0 460 215'%3E%3Crect width='460' height='215' fill='%230b0f19'/%3E%3Crect x='1' y='1' width='458' height='213' fill='none' stroke='%231f2a37' stroke-width='2'/%3E%3Ccircle cx='230' cy='95' r='32' fill='none' stroke='%232a475e' stroke-width='3'/%3E%3Ccircle cx='230' cy='95' r='12' fill='%232a475e'/%3E%3Crect x='198' y='92' width='64' height='6' rx='3' fill='%232a475e'/%3E%3Crect x='227' y='63' width='6' height='64' rx='3' fill='%232a475e'/%3E%3Ctext x='230' y='152' font-family='system-ui,sans-serif' font-size='13' fill='%234a5568' text-anchor='middle'%3ESem Imagem%3C/text%3E%3C/svg%3E";

  const formatDate = (timestamp) => {
    if (!timestamp || timestamp === 0) return 'Nunca';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div
      ref={cardRef}
      className={`card tgc-card ${rarity} ${platformType} interactive${isActive ? ' active' : ''}${hovered ? ' interacting' : ''}${loading ? ' loading' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={staticStylesRef.current}
    >
      <div className="card__translater">
        <button
          className="card__rotator"
          aria-label={`Visualizar jogo ${game.name}`}
          tabIndex="0"
        >
          {/* Verso do Card */}
          <div className="card__back tgc-card-back">
            <div className="tgc-card-back-header">
              <span className="tgc-card-back-title" title={game.name}>{game.name}</span>
              <span className="tgc-card-back-app-id">ID: {game.appid}</span>
            </div>
            <div className="tgc-card-back-divider" />
            <div className="tgc-card-back-body">
              <div className="tgc-back-stat-row">
                <span className="label">Tempo Total:</span>
                <span className="value">{playtimeHours}h</span>
              </div>
              {game.playtime_2weeks > 0 && (
                <div className="tgc-back-stat-row highlight">
                  <span className="label">Últimas 2 semanas:</span>
                  <span className="value">{Math.round(game.playtime_2weeks / 60)}h</span>
                </div>
              )}
              <div className="tgc-back-stat-row">
                <span className="label">Último Acesso:</span>
                <span className="value">{formatDate(game.rtime_last_played)}</span>
              </div>
              <div className="tgc-back-stat-row">
                <span className="label">Plataforma:</span>
                <span className="value platform-badge">
                  <span style={{ display: 'inline-flex', width: '11px', height: '11px' }}>{platformIcon}</span>
                  {' '}{platformLabel}
                </span>
              </div>
              <div className="tgc-back-stat-row">
                <span className="label">Sucesso (DEF):</span>
                <span className="value">{defenseStat}</span>
              </div>
            </div>
            <div className="tgc-card-back-footer">
              <a href={`https://store.steampowered.com/app/${game.appid}`}
                target="_blank" rel="noopener noreferrer"
                className="tgc-back-btn store"
                onClick={(e) => e.stopPropagation()}>
                Loja
              </a>
              <a href={`https://steamcommunity.com/app/${game.appid}`}
                target="_blank" rel="noopener noreferrer"
                className="tgc-back-btn community"
                onClick={(e) => e.stopPropagation()}>
                Painel
              </a>
              {playerSteamId && (
                <a href={`https://steamcommunity.com/profiles/${playerSteamId}/stats/${game.appid}`}
                  target="_blank" rel="noopener noreferrer"
                  className="tgc-back-btn achievements"
                  onClick={(e) => e.stopPropagation()}>
                  Conquistas
                </a>
              )}
            </div>
          </div>

          {/* Frente do Card */}
          <div className="card__front tgc-card-front">
            <div className="tgc-card-header">
              <span className="tgc-card-title" title={game.name}>{game.name}</span>
              <span className="tgc-card-element" title={`Elemento: ${platformLabel}`}>{platformIcon}</span>
            </div>

            <div className="tgc-card-frame">
              <img
                className="tgc-card-image"
                src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`}
                alt={game.name}
                onLoad={() => setLoading(false)}
                onError={(e) => { e.target.src = FALLBACK_IMG; }}
                loading="lazy"
              />
            </div>

            <div className="tgc-card-type">{rarityLabel}</div>
            <div className="tgc-card-desc">
              {description || `Este card representa a licença oficial de ${game.name} registrada na rede Steam. A potência é proporcional ao tempo de engajamento do jogador.`}
            </div>
            <div className="tgc-card-stats">
              <span className="atk" title="Ataque (Playtime)">ATK: {playtimeHours}h</span>
              <span className="def" title="Defesa (Conquistas Estimadas)">DEF: {defenseStat}</span>
            </div>

            <div className="card__shine tgc-card-shine" />
            <div className="card__glare tgc-card-glare" />
          </div>
        </button>
      </div>
    </div>
  );
}

// ─── Componente Home principal ────────────────────────────────────────────────
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

  const [selectedGame, setSelectedGame] = useState(null);
  const [hoveredGameBanner, setHoveredGameBanner] = useState(null);
  const [activeBanner, setActiveBanner] = useState(null);

  useEffect(() => {
    if (hoveredGameBanner) {
      setActiveBanner(hoveredGameBanner);
    }
  }, [hoveredGameBanner]);

  const fetchData = async (id) => {
    if (!id || id.trim() === '') return;
    setLoading(true);
    setError(null);
    try {
      let url = `/api/steam/profile/${id.trim()}`;
      if (typeof window !== 'undefined' && window.location.port && window.location.port !== '80' && window.location.port !== '443') {
        url = `http://${window.location.hostname}/api/steam/profile/${id.trim()}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Não foi possível obter os dados da Steam. Certifique-se de que o backend está rodando e que o SteamID/Usuário é válido.');
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

  const games = data?.games || [];
  const totalGames = data?.game_count || 0;
  const totalPlaytimeMinutes = games.reduce((acc, game) => acc + (game.playtime_forever || 0), 0);
  const totalPlaytimeHours = Math.round(totalPlaytimeMinutes / 60);

  const topGame = games.length > 0 
    ? [...games].sort((a, b) => (b.playtime_forever || 0) - (a.playtime_forever || 0))[0]
    : null;
  const topGameHours = topGame ? Math.round(topGame.playtime_forever / 60) : 0;

  // Filtrar e ordenar
  const filteredAndSortedGames = games
    .filter((game) => {
      const matchesName = game.name?.toLowerCase().includes(searchGame.toLowerCase());
      if (filterPlayed === 'played') {
        return matchesName && (game.playtime_forever || 0) > 0;
      }
      if (filterPlayed === 'unplayed') {
        return matchesName && (game.playtime_forever || 0) === 0;
      }
      return matchesName;
    })
    .sort((a, b) => {
      if (sortBy === 'playtime-desc') return (b.playtime_forever || 0) - (a.playtime_forever || 0);
      if (sortBy === 'playtime-asc') return (a.playtime_forever || 0) - (b.playtime_forever || 0);
      if (sortBy === 'name-asc') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'name-desc') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'recent') return (b.rtime_last_played || 0) - (a.rtime_last_played || 0);
      return 0;
    });

  return (
    <>
      <div 
        className={`cinema-background ${hoveredGameBanner ? 'active' : ''}`}
        style={{ backgroundImage: activeBanner ? `url(${activeBanner})` : 'none' }}
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

            {/* Grid de Cartas TGC */}
            {filteredAndSortedGames.length > 0 ? (
              <div className="tgc-deck-container">
                {filteredAndSortedGames.map((game) => (
                  <TGCCard
                    key={game.appid}
                    game={game}
                    isActive={selectedGame?.appid === game.appid}
                    onCardClick={setSelectedGame}
                    setHoveredGameBanner={setHoveredGameBanner}
                    playerSteamId={data?.player?.steamid}
                  />
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

      {selectedGame && (
        <div className="modal-backdrop-blur active" onClick={() => setSelectedGame(null)} />
      )}
    </>
  );
}
