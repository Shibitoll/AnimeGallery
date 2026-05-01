import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from './ui';

const AnimeCard = ({ 
  id, mal_id, title, poster, rating, userRating, year, episodes, 
  studio, genres, isFavorite, isWatched, onToggleFavorite, 
  onToggleWatched, isAddedByUser, onDeleteAnime, onUpdateRating 
}) => {
  
  const displayUserRating = userRating ? parseFloat(userRating).toFixed(1) : '0.0';
  const displayGenres = Array.isArray(genres) ? genres.join(', ') : genres;
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(displayUserRating);
  
  useEffect(() => {
    setTempRating(displayUserRating);
  }, [displayUserRating]);

  const handleSave = () => {
    const numRating = parseFloat(tempRating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) return;
    onUpdateRating(id, numRating.toFixed(1));
    setIsEditing(false);
  };
  
  const handlePrefetch = () => {
    fetch(`http://localhost:8000/api/streaming/info/${id}/`).catch(() => {});
  };

  return (
    <Card 
      className={`anime-card-modern compact ${isWatched ? 'watched' : ''}`}
      onMouseEnter={handlePrefetch}
    >
      <div className="poster-container">
        <Link to={`/anime/${mal_id || id}`} className="poster-link">
          <img src={poster} alt={title} className="poster-image" loading="lazy" />
          <div className="poster-overlay"><span className="play-icon">▶</span></div>
        </Link>
        
        {rating && parseFloat(rating) > 0 && (
          <span className="global-rating">★ {parseFloat(rating).toFixed(1)}</span>
        )}
      
        <button 
          className={`action-icon-btn favorite ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault(); e.stopPropagation(); onToggleFavorite(id);
          }}
        >
          {isFavorite ? '❤️' : '🤍'}
        </button>

        {isAddedByUser && (
          <button className="action-icon-btn delete" onClick={(e) => {
            e.preventDefault(); e.stopPropagation(); onDeleteAnime(id);
          }}>🗑️</button>
        )}
      </div>

      <div className="card-info compact-info">
        <Link to={`/anime/${mal_id || id}`} className="title-link">
          <h3 className="anime-title" title={title}>{title}</h3>
        </Link>
        
        <div className="meta-tags">
          {year && year !== '-' && <span className="meta-tag">{year}</span>}
          {episodes > 0 && <span className="meta-tag">{episodes} сер.</span>}
        </div>

        {displayGenres && <span className="genre-text compact-genre">{displayGenres}</span>}

        <div className="card-actions compact-actions">
          <Button 
            variant={isWatched ? 'primary' : 'outline'} 
            onClick={() => onToggleWatched(id)}
            className={`full-width-btn ${isWatched ? 'watched-btn' : ''}`}
          >
            {isWatched ? '✅' : '👁️ Буду дивитись'}
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
                <strong className={`user-score ${parseFloat(displayUserRating) > 0 ? 'rated' : ''}`}>
                  {displayUserRating}
                </strong>
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