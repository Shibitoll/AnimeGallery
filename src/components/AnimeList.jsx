import React, { useState } from 'react';
import AnimeCard from './AnimeCard';

/**
 * Компонент-список для відображення сітки збережених аніме-карток.
 * @component
 */
const AnimeList = ({ list, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onDeleteAnime, onUpdateRating }) => {
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  if (!list || list.length === 0) {
    return <p className="empty-message">Список порожній.</p>;
  }

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = list.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
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
        {/* ВИПРАВЛЕНО: Додано index та надійний key */}
        {currentItems.map((anime, index) => (
          <AnimeCard 
              key={anime.id || anime.anihubId || anime.mal_id || `anime-${index}`}
              {...anime}
              onToggleFavorite={onToggleFavorite} 
              onToggleWatching={onToggleWatching}
              onToggleWatched={onToggleWatched}
              onTogglePlanned={onTogglePlanned}
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