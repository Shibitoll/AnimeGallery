import React from 'react';
import AnimeCard from './AnimeCard';

/**
 * Компонент-список для відображення сітки аніме-карток.
 * Приймає масив даних та функції зворотного виклику, які передаються 
 * у кожен компонент AnimeCard для взаємодії з API.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {Array<Object>} props.list - Масив об'єктів аніме, отриманих з бекенду.
 * @param {Function} props.onToggleFavorite - Функція для перемикання статусу "улюблене".
 * @param {Function} props.onToggleWatched - Функція для перемикання статусу "переглянуто".
 * @param {Function} props.onDeleteAnime - Функція для видалення аніме з бази даних.
 * @param {Function} props.onUpdateRating - Функція для оновлення рейтингу користувача.
 * @returns {JSX.Element} Сітка з картками аніме або повідомлення про завантаження.
 */
const AnimeList = ({ list, onToggleFavorite, onToggleWatched, onDeleteAnime, onUpdateRating }) => {
  
  if (!list) return <p>Завантаження...</p>;

  return (
    <div className="anime-grid">
      {list.map((anime) => (
        <AnimeCard 
            key={anime.id}
            {...anime}
            onToggleFavorite={onToggleFavorite} 
            onToggleWatched={onToggleWatched}
            isAddedByUser={anime.isAddedByUser}
            onDeleteAnime={onDeleteAnime}
            onUpdateRating={onUpdateRating}
        />
      ))}
    </div>
  );
};

export default AnimeList;