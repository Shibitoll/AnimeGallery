import React from 'react';

const AnimeCard = ({ title, poster, rating, description, year, episodes, studio, genres }) => {
  return (
    <article className="anime-card">
      <div className="poster-wrapper">
        <img src={poster} alt={title} className="card-image" />
        <span className="rating-badge">★ {rating}</span>
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
      </div>
    </article>
  );
};

export default AnimeCard;