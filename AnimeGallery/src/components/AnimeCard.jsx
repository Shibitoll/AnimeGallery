import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from './ui';

const AnimeCard = ({ id, title, poster, rating, userRating, description, year, episodes, studio, genres, isFavorite, isWatched, onToggleFavorite, onToggleWatched, isAddedByUser, onDeleteAnime, onUpdateRating }) => {
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
    <Card className={isWatched ? 'watched-card' : ''}>
      <div className="poster-wrapper">
        <img src={poster} alt={title} className="card-image" />
        <span className="rating-badge">★ {rating}</span>
      
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault(); 
            onToggleFavorite(id);
          }}
          aria-label="Додати до улюблених"
        >
          {isFavorite ? '❤️' : '♡'}
        </button>

        {isAddedByUser && (
          <button className="delete-btn" onClick={() => onDeleteAnime(id)}>
            🗑️
          </button>
        )}
      </div>

      {/* Основний контент */}
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

        <Button 
          variant={isWatched ? 'primary' : 'secondary'} 
          onClick={() => onToggleWatched(id)}
          className="watch-status-btn"
          style={{ width: '100%', marginTop: '10px' }}
        >
          {isWatched ? '✅ Переглянуто' : '👁️ Буду дивитись'}
        </Button>

        <div className="user-rating-section">
          <p>Ваша оцінка: 
            {isEditing ? (
              <Input 
                type="number" 
                step="0.1" 
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
                style={{ width: '70px', display: 'inline-block', marginLeft: '10px' }}
              />
            ) : (
              <strong> {personalRating}</strong>
            )}
          </p>
          
          <Button 
            variant="secondary" 
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            style={{ width: '100%', marginTop: '5px' }}
          >
            {isEditing ? 'Зберегти' : 'Бажаєте змінити?'}
          </Button>

          <Link to={`/anime/${id}`} style={{ textDecoration: 'none', display: 'block', marginTop: '10px' }}>
            <Button 
              variant="secondary" 
              className="details-link-btn"
              style={{ width: '100%' }}
            >
              Детальніше →
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default AnimeCard;