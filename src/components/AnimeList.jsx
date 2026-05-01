import React, { useState } from 'react';
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Скільки карток показувати на одній сторінці

  if (!list || list.length === 0) {
    return <p className="empty-message">Завантаження...</p>;
  }

  // Математика пагінації
  const totalPages = Math.ceil(list.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  // Вирізаємо потрібний шматок масиву для відображення
  const currentItems = list.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Плавна прокрутка сторінки вгору при перемиканні
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="anime-list-wrapper">
      <div className="anime-grid">
        {currentItems.map(anime => (
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
{totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
          <button className="page-btn" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>&larr;</button>
          
          <div className="page-numbers">
            {getPageNumbers().map(num => (
              <button 
                key={num} 
                className={`num-btn ${currentPage === num ? 'active' : ''}`}
                onClick={() => handlePageChange(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)}>&rarr;</button>
          <button className="page-btn" disabled={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
        </div>
      )}
    </div>
  );
};
export default AnimeList;