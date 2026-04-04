import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from './ui';

/**
 * Компонент картки окремого аніме.
 * Відображає детальну інформацію про тайтл, дозволяє змінювати статуси
 * (улюблене, переглянуто), видаляти додані користувачем записи та редагувати персональну оцінку.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {number} props.id - Унікальний ідентифікатор аніме.
 * @param {string} props.title - Назва аніме.
 * @param {string} props.poster - URL зображення постера.
 * @param {number|string} props.rating - Загальний рейтинг аніме.
 * @param {number|string} props.userRating - Персональна оцінка користувача.
 * @param {string} props.description - Короткий опис сюжету.
 * @param {string} props.year - Рік випуску.
 * @param {string|number} props.episodes - Кількість епізодів.
 * @param {string} props.studio - Студія виробництва.
 * @param {string} props.genres - Жанри аніме.
 * @param {boolean} props.isFavorite - Чи додано аніме в улюблені.
 * @param {boolean} props.isWatched - Чи позначено аніме як переглянуте.
 * @param {Function} props.onToggleFavorite - Функція для зміни статусу "улюблене".
 * @param {Function} props.onToggleWatched - Функція для зміни статусу "переглянуто".
 * @param {boolean} props.isAddedByUser - Чи було аніме додане користувачем вручну.
 * @param {Function} props.onDeleteAnime - Функція для видалення аніме.
 * @param {Function} props.onUpdateRating - Функція для оновлення персональної оцінки.
 */
const AnimeCard = ({ 
  id, title, poster, rating, userRating, description, year, episodes, 
  studio, genres, isFavorite, isWatched, onToggleFavorite, 
  onToggleWatched, isAddedByUser, onDeleteAnime, onUpdateRating 
}) => {
  
  /** * Форматований рейтинг для відображення (завжди один знак після коми).
   * Використовуємо parseFloat для коректної обробки рядків з БД.
   */
  const displayUserRating = userRating ? parseFloat(userRating).toFixed(1) : '0.0';
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempRating, setTempRating] = useState(displayUserRating);
  
  // Логіка синхронізації: якщо рейтинг змінився зовні (наприклад, через API), 
  // оновлюємо локальний стан редагування
  const [prevRating, setPrevRating] = useState(displayUserRating);
  if (displayUserRating !== prevRating) {
    setPrevRating(displayUserRating);
    setTempRating(displayUserRating);
  }

  /**
   * Обробник збереження нової оцінки.
   * Валідує введене число (0-10) та викликає функцію оновлення.
   */
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
        <span className="rating-badge" title="Загальний рейтинг">★ {rating}</span>
      
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault(); 
            onToggleFavorite(id);
          }}
          title={isFavorite ? "Прибрати з улюблених" : "Додати в улюблені"}
          aria-label="Додати до улюблених"
        >
          {isFavorite ? '❤️' : '♡'}
        </button>

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

        <Button 
          variant={isWatched ? 'primary' : 'secondary'} 
          onClick={() => onToggleWatched(id)}
          className={`watch-status-btn ${isWatched ? 'is-watched' : ''}`}
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
                min="0"
                max="10"
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
                style={{ width: '70px', display: 'inline-block', marginLeft: '10px' }}
                autoFocus
              />
            ) : (
              <strong className="user-score"> {displayUserRating}</strong>
            )}
          </p>
          
          <Button 
            variant="secondary" 
            className={isEditing ? 'saving' : ''}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            style={{ width: '100%', marginTop: '5px' }}
          >
            {isEditing ? '💾 Зберегти' : '✎ Змінити оцінку'}
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