import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from './ui';
import '../styles/AnimeCard.css';

const AnimeCard = ({ 
  id, mal_id, malId, anihubId, anihub_id, title, titleUkrainian, poster, poster_url, rating, user_rating, userRating, year, episodes, episodesCount, 
  studio, genres, is_favorite, isFavorite, is_watching, isWatching, in_watchlist, inWatchlist, isWatched, planned, 
  onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, 
  is_added_by_user, isAddedByUser, onDeleteAnime, onUpdateRating 
}) => {
  
  // Безпечна уніфікація ID для запобігання посилань "undefined"
  const actualAnihubId = anihubId || anihub_id || mal_id || malId || id;
  const actualTitle = titleUkrainian || title || 'Без назви';
  const actualPoster = poster_url || poster;
  const actualEpisodes = episodesCount || episodes || 0;
  
  const actualFavorite = is_favorite || isFavorite || false;
  const actualWatching = is_watching || isWatching || false;
  const actualWatched = in_watchlist || inWatchlist || isWatched || false;
  const actualPlanned = planned || false;
  const actualUserRating = user_rating || userRating;
  const actualAddedByUser = is_added_by_user || isAddedByUser;
  
  const displayUserRating = actualUserRating ? parseFloat(actualUserRating).toFixed(1) : '0.0';
  
  let displayGenres = "Невідомо";
  if (Array.isArray(genres)) {
      displayGenres = genres.map(g => typeof g === 'object' ? g.name : g).join(', ');
  } else if (typeof genres === 'string') {
      displayGenres = genres;
  }
  
  const [optFavorite, setOptFavorite] = useState(actualFavorite);
  const [optWatching, setOptWatching] = useState(actualWatching);
  const [optWatched, setOptWatched] = useState(actualWatched);
  const [optPlanned, setOptPlanned] = useState(actualPlanned);
  const [optRating, setOptRating] = useState(displayUserRating);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(displayUserRating);

  const [prevProps, setPrevProps] = useState({
    fav: actualFavorite, watchng: actualWatching, watch: actualWatched, plan: actualPlanned, rating: displayUserRating
  });

  if (
    actualFavorite !== prevProps.fav || actualWatching !== prevProps.watchng ||
    actualWatched !== prevProps.watch || actualPlanned !== prevProps.plan ||
    displayUserRating !== prevProps.rating
  ) {
    setPrevProps({ fav: actualFavorite, watchng: actualWatching, watch: actualWatched, plan: actualPlanned, rating: displayUserRating });
    setOptFavorite(actualFavorite);
    setOptWatching(actualWatching);
    setOptWatched(actualWatched);
    setOptPlanned(actualPlanned);
    setOptRating(displayUserRating);
    setTempRating(displayUserRating);
  }

  const getAnimePayload = () => ({
    id, mal_id: actualAnihubId, anihubId: actualAnihubId, title: actualTitle, titleUkrainian: actualTitle, poster: actualPoster, rating, year, episodes: actualEpisodes, episodesCount: actualEpisodes, studio: studio || 'Невідомо', genres: displayGenres, is_favorite: optFavorite, is_watching: optWatching, in_watchlist: optWatched, planned: optPlanned
  });

  const handleToggleFav = (e) => {
    e.preventDefault(); e.stopPropagation();
    setOptFavorite(!optFavorite);
    onToggleFavorite(getAnimePayload());
  };

  const handleToggleWatching = () => {
    const newVal = !optWatching;
    setOptWatching(newVal);
    if (newVal) { setOptWatched(false); setOptPlanned(false); }
    onToggleWatching(getAnimePayload());
  };

  const handleToggleWatched = () => {
    const newVal = !optWatched;
    setOptWatched(newVal);
    if (newVal) { setOptWatching(false); setOptPlanned(false); }
    onToggleWatched(getAnimePayload());
  };

  const handleTogglePlanned = () => {
    const newVal = !optPlanned;
    setOptPlanned(newVal);
    if (newVal) { setOptWatching(false); setOptWatched(false); }
    onTogglePlanned(getAnimePayload());
  };

  const handleSave = () => {
    const numRating = parseFloat(tempRating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) return;
    setOptRating(numRating.toFixed(1));
    onUpdateRating(getAnimePayload(), numRating.toFixed(1)); 
    setIsEditing(false);
  };

  return (
    <Card className={`anime-card-modern compact ${optWatched ? 'watched' : ''}`}>
      <div className="poster-container">
        <Link to={`/anime/${actualAnihubId}`} className="poster-link">
          <img src={actualPoster} alt={actualTitle} className="poster-image" loading="lazy" />
          <div className="poster-overlay"><span className="play-icon">▶</span></div>
        </Link>
        
        {rating && parseFloat(rating) > 0 && (
          <span className="global-rating">★ {parseFloat(rating).toFixed(1)}</span>
        )}
      
        <button className={`action-icon-btn favorite ${optFavorite ? 'active' : ''}`} onClick={handleToggleFav}>
          {optFavorite ? '❤️' : '🤍'}
        </button>

        {actualAddedByUser && (
          <button className="action-icon-btn delete" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDeleteAnime(id); }}>🗑️</button>
        )}
      </div>

      <div className="card-info compact-info">
        <Link to={`/anime/${actualAnihubId}`} className="title-link">
          <h3 className="anime-title" title={actualTitle}>{actualTitle}</h3>
        </Link>
        
        <div className="meta-tags">
          {year && year !== '-' && <span className="meta-tag">{year}</span>}
          {actualEpisodes > 0 && <span className="meta-tag">{actualEpisodes} сер.</span>}
        </div>

        {displayGenres && <span className="genre-text compact-genre">{displayGenres}</span>}

        <div className="card-actions compact-actions">
          {!optWatching && !optWatched && (
            <Button variant="outline" onClick={handleToggleWatching} className="full-width-btn" style={{ marginBottom: '8px' }}>
              👁️ Буду дивитися
            </Button>
          )}

          {optWatching && !optWatched && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <div style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius)', fontSize: '0.9rem', fontWeight: '600', cursor: 'default' }} className="full-width-btn">
                ▶️ Дивлюся
              </div>
              <Button variant="outline" onClick={handleToggleWatched} className="full-width-btn" style={{ flex: 1, padding: '8px 4px' }} title="Завершити перегляд?">
                🏁 Завершив?
              </Button>
            </div>
          )}

          {optWatched && (
            <Button variant="primary" onClick={handleToggleWatched} className="full-width-btn watched-btn" style={{ marginBottom: '8px', backgroundColor: '#10b981', borderColor: '#10b981' }}>
              ✅ Переглянуто
            </Button>
          )}

          <Button variant={optPlanned ? 'primary' : 'outline'} onClick={handleTogglePlanned} className={`full-width-btn ${optPlanned ? 'planned-btn' : ''}`}>
            {optPlanned ? '📅 В планах' : '⏳ Додати в плани'}
          </Button>

          <div className="user-rating-box compact-rating">
            {isEditing ? (
              <div className="edit-rating-wrapper">
                <Input type="number" step="0.1" min="0" max="10" value={tempRating} onChange={(e) => setTempRating(e.target.value)} className="rating-input" autoFocus />
                <Button variant="primary" className="save-btn small" onClick={handleSave}>💾</Button>
              </div>
            ) : (
              <div className="display-rating-wrapper" onClick={() => setIsEditing(true)}>
                <span>Моя оцінка: </span>
                <strong className={`user-score ${parseFloat(optRating) > 0 ? 'rated' : ''}`}>{optRating}</strong>
                <span className="edit-hint">✎</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AnimeCard;