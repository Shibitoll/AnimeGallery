import React, { useState} from 'react';

const AnimeCard = ({ 
  id, title, poster, rating, userRating, description, year, episodes, 
  studio, genres, isFavorite, isWatched, onToggleFavorite, 
  onToggleWatched, isAddedByUser, onDeleteAnime, onUpdateRating 
}) => {
  
  const displayUserRating = userRating ? parseFloat(userRating).toFixed(1) : '0.0';
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(displayUserRating);

const [prevRating, setPrevRating] = useState(displayUserRating);

if (displayUserRating !== prevRating) {
  setPrevRating(displayUserRating);
  setTempRating(displayUserRating);
}

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
      
        {/* Кнопка лайку — додано клас 'active' для стилізації */}
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`} 
          onClick={() => onToggleFavorite(id)}
          title={isFavorite ? "Прибрати з улюблених" : "Додати в улюблені"}
        >
          {isFavorite ? '❤️' : '♡'}
        </button>

        {/* Кнопка видалення */}
        {isAddedByUser && (
          <button 
            className="delete-btn" 
            onClick={() => onDeleteAnime(id)}
            title="Видалити аніме"
          >
            🗑
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

        {/* Кнопка "Переглянуто" — динамічний текст та іконка */}
        <button 
          className={`watch-status-btn ${isWatched ? 'is-watched' : ''}`}
          onClick={() => onToggleWatched(id)}
        >
          {isWatched ? '✅ Переглянуто' : '👁 Буду дивитись'}
        </button>

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
                autoFocus
              />
            ) : (
              <strong className="user-score"> {displayUserRating}</strong>
            )}
          </p>
          
          <button 
            className={`edit-rating-btn ${isEditing ? 'saving' : ''}`} 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
          >
            {isEditing ? '💾 Зберегти' : '✎ Змінити оцінку'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default AnimeCard;
