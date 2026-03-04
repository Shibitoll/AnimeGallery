import React from 'react';

const AnimeCard = ({ id, title, poster, rating, description, year, episodes, studio, genres, isFavorite, isWatched, onToggleFavorite, onToggleWatched }) => {
  return (
    <article className={`anime-card ${isWatched ? 'watched-card' : ''}`}>
      <div className="poster-wrapper">
        <img src={poster} alt={title} className="card-image" />
        <span className="rating-badge">★ {rating}</span>
      
        {/* Кнопка лайку */}
        <button className="favorite-btn" onClick={() => onToggleFavorite(id)}>
          {isFavorite ? '❤️' : '♡'}
        </button>
      </div>

      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-desc">{description}</p>
        
        <div className="genres-list">
          <span className="genre-tag">{genres}</span>
        </div>

        <div className="card-footer-info">
          <span>{year}</span>
          <span>{episodes} сер.</span>
          <span>{studio}</span>
        </div>

        {/* Кнопка "Переглянуто" */}
        <button 
          className={`watch-status-btn ${isWatched ? 'is-watched' : ''}`}
          onClick={() => onToggleWatched(id)}
        >
          {isWatched ? '✅ Переглянуто' : '👁️ Буду дивитись'}
        </button>

      </div>
    </article>
  );
};

export default AnimeCard;