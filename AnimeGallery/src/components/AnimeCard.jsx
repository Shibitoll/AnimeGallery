import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AnimeCard = ({ id, title, poster, rating, userRating, description, year, episodes, studio, genres, isFavorite, isWatched, onToggleFavorite, onToggleWatched, isAddedByUser, onDeleteAnime, onUpdateRating }) => {
  // Якщо userRating ще не встановлено, показуємо "0.0"
  const personalRating = userRating !== undefined ? userRating : '0.0';
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(personalRating);

  const handleSave = () => {
    const numRating = parseFloat(tempRating);
    if (isNaN(numRating) || numRating < 0 || numRating > 10) {
      alert("Будь ласка, введіть число від 0 до 10");
      return;
    }
    onUpdateRating(id, numRating.toFixed(1));
    setIsEditing(false);
  };
  
  return (
    <article className={`anime-card ${isWatched ? 'watched-card' : ''}`}>
      <div className="poster-wrapper">
        <img src={poster} alt={title} className="card-image" />
        <span className="rating-badge" title="Загальний рейтинг">★ {rating}</span>
      
        {/* Кнопка лайку */}
        <button className="favorite-btn" onClick={() => onToggleFavorite(id)}>
          {isFavorite ? '❤️' : '♡'}
        </button>

        {/* Кнопка видалення (з'являється тільки для доданих користувачем) */}
        {isAddedByUser && (
          <button 
            className="delete-btn" 
            onClick={() => onDeleteAnime(id)}
            title="Видалити аніме"
          >
            🗑️
          </button>
        )}
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

        {/* Секція власної оцінки */}
        <div className="user-rating-section">
          <p>Ваша оцінка: 
            {isEditing ? (
              <input 
                type="number" 
                step="0.1" 
                min="0" 
                max="10" 
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
                className="rating-input"
              />
            ) : (
              <strong> {personalRating}</strong>
            )}
          </p>
          
          <button 
            className="edit-rating-btn" 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? 'Зберегти зміни' : 'Бажаєте змінити?'}
          </button>
          <Link to={`/anime/${id}`} className="details-link">
            Детальніше →
          </Link>
        </div>

      </div>
    </article>
  );
};

export default AnimeCard;