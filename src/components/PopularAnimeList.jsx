import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import { streamingApi } from '../api/streamingApi';

const PopularAnimeList = ({ 
  data, 
  onToggleFavorite, 
  onToggleWatching, 
  onToggleWatched, 
  onTogglePlanned, 
  onUpdateRating, 
  isHomePage 
}) => {
  const [popular, setPopular] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Фільтри (AniHub підтримує 'type')
  const [filters, setFilters] = useState({ type: '' });
  const [localSort, setLocalSort] = useState('default');

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setIsLoading(true);
        // Запит через Django-проксі до AniHub API
        const result = await streamingApi.getPopular(page, filters.type);
        
        const animeList = result.items || [];
        
        // Розрахунок пагінації (total / page_size)
        const total = result.total || 0;
        const pageSize = result.page_size || 20;
        const calcTotalPages = Math.ceil(total / pageSize);

        setTotalPages(calcTotalPages || 1);
        setHasNextPage(page < calcTotalPages);

        // Усунення дублікатів за ID
        const uniqueAnime = Array.from(new Map(animeList.map(item => [item.id, item])).values());
        setPopular(uniqueAnime); 
      } catch (err) {
        console.error("Помилка завантаження популярних:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopular();
  }, [page, filters.type]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const getSortedAnime = (animeArray) => {
    let sorted = [...animeArray];
    switch (localSort) {
      case 'title_asc':
        return sorted.sort((a, b) => (a.title_ukrainian || '').localeCompare(b.title_ukrainian || ''));
      case 'title_desc':
        return sorted.sort((a, b) => (b.title_ukrainian || '').localeCompare(a.title_ukrainian || ''));
      case 'rating_desc':
        return sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      case 'rating_asc':
        return sorted.sort((a, b) => parseFloat(a.rating || 0) - parseFloat(b.rating || 0));
      case 'year_desc':
        return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      case 'year_asc':
        return sorted.sort((a, b) => (parseInt(a.year) || 9999) - (parseInt(b.year) || 9999));
      case 'episodes_desc':
        return sorted.sort((a, b) => (parseInt(b.episodes_count) || 0) - (parseInt(a.episodes_count) || 0));
      default:
        return sorted;
    }
  };

  const baseAnimeList = isHomePage ? popular.slice(0, 10) : popular;
  const finalDisplayedAnime = getSortedAnime(baseAnimeList);

  return (
    <div className="api-section">
      {!isHomePage && (
        <div className="section-header">
          <h2 className="gallery-title" style={{ marginTop: 'var(--space-lg)', color: 'var(--text-primary)' }}>
            Популярні аніме (Українською)
          </h2>

          <div className="filters-container" style={{ marginBottom: '30px', justifyContent: 'flex-start' }}>
            <div className="filter-group">
              <label>Формат випуску</label>
              <select value={filters.type} onChange={(e) => { setFilters({...filters, type: e.target.value}); setPage(1); }}>
                <option value="">Усі формати</option>
                <option value="tv">TV-серіал</option>
                <option value="movie">Фільм</option>
                <option value="ova">OVA / ONA</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Відсортувати</label>
              <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} style={{ borderLeft: '3px solid var(--neon-accent)' }}>
                <option value="default">Рейтинг AniHub</option>
                <option value="rating_desc">Найкращі ★</option>
                <option value="title_asc">А-Я</option>
                <option value="year_desc">Новинки</option>
              </select>
            </div>

            {(filters.type || localSort !== 'default') && (
              <button className="reset-filters-btn" onClick={() => { setFilters({ type: '' }); setLocalSort('default'); setPage(1); }}>
                ✕ Скинути
              </button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="loading-spinner" style={{ margin: '40px auto' }}></div>
      ) : (
        <div className="anime-grid">
          {finalDisplayedAnime.map((anime) => {
            const animeId = anime.id;
            const title = anime.title_ukrainian || anime.title_english || anime.title_original;
            
            // Синхронізація з локальною базою за anihubId
            const localAnime = data.find(a => String(a.anihubId) === String(animeId));

            const handleAction = (actionType, value = '0.0') => {
              // Формуємо payload: беремо дані з бази або створюємо нові з API
              const animeData = localAnime || {
                anihubId: animeId,
                titleUkrainian: title,
                poster: anime.poster_url,
                rating: anime.rating || '0.0',
                year: anime.year,
                episodesCount: anime.episodes_count || 0,
                genres: anime.genres || [],
                description: anime.description_uk || anime.description || ""
              };

              // Викликаємо відповідну дію (App.jsx автоматично зробить POST або PATCH)
              if (actionType === 'favorite') onToggleFavorite(animeData);
              if (actionType === 'watching') onToggleWatching(animeData);
              if (actionType === 'watched') onToggleWatched(animeData);
              if (actionType === 'planned') onTogglePlanned(animeData);
              if (actionType === 'rating') onUpdateRating(animeData, value);
            };

            return (
              <AnimeCard 
                key={`pop-${animeId}`}
                // Передаємо всі локальні статуси (is_favorite тощо), якщо аніме вже в базі
                {...(localAnime ? localAnime : {})}
                anihubId={animeId}
                titleUkrainian={title}
                poster_url={anime.poster_url}
                rating={anime.rating}
                year={anime.year}
                episodesCount={anime.episodes_count}
                genres={anime.genres}
                onToggleFavorite={() => handleAction('favorite')}
                onToggleWatching={() => handleAction('watching')}
                onToggleWatched={() => handleAction('watched')}
                onTogglePlanned={() => handleAction('planned')}
                onUpdateRating={(_, val) => handleAction('rating', val)}
              />
            );
          })}
        </div>
      )}

      {!isHomePage && !isLoading && totalPages > 1 && (
        <div className="pagination-container">
          <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
          <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>&larr; Назад</button>
          <div className="page-numbers">
            {getPageNumbers().map(num => (
              <button key={num} className={`num-btn ${page === num ? 'active' : ''}`} onClick={() => handlePageChange(num)}>{num}</button>
            ))}
          </div>
          <button className="page-btn" disabled={!hasNextPage} onClick={() => handlePageChange(page + 1)}>Вперед &rarr;</button>
          <button className="page-btn" disabled={!hasNextPage} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
        </div>
      )}
    </div>
  );
};

export default PopularAnimeList;