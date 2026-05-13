import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';
import { streamingApi } from '../api/streamingApi';

const TopAnimeList = ({ data, onAddAnime, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating, isHomePage }) => {
  const [topAnime, setTopAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [filters, setFilters] = useState({ type: '' });
  const [localSort, setLocalSort] = useState('default');

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        setIsLoading(true);
        // Використовуємо streamingApi для новинок (онгоїнгів)[cite: 1]
        const result = await streamingApi.getTopAiring(page, filters.type);
        
        const animeList = result.items || [];
        
        const total = result.total || 0;
        const pageSize = result.page_size || 20;
        const calcTotalPages = Math.ceil(total / pageSize);
        
        setTotalPages(calcTotalPages || 1);
        setHasNextPage(page < calcTotalPages);

        const uniqueAnime = Array.from(new Map(animeList.map(item => [item.id, item])).values());
        setTopAnime(uniqueAnime);
      } catch (err) {
        console.error("Помилка завантаження новинок:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopAnime();
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
      case 'rating_desc':
        return sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      case 'year_desc':
        return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      default:
        return sorted; 
    }
  };

  const baseAnimeList = isHomePage ? topAnime.slice(0, 10) : topAnime;
  const finalDisplayedAnime = getSortedAnime(baseAnimeList);

  return (
    <section className="api-section">
      {!isHomePage && (
        <div className="section-header">
          <h2 className="gallery-title" style={{ marginTop: 'var(--space-lg)', color: 'var(--text-primary)' }}>
            Новинки цього сезону (Онгоїнги)
          </h2>
          
          <div className="filters-container" style={{ marginBottom: '30px', justifyContent: 'flex-start' }}>
            <div className="filter-group">
              <label>Формат випуску</label>
              <select value={filters.type} onChange={(e) => { setFilters({ ...filters, type: e.target.value }); setPage(1); }}>
                <option value="">Усі формати</option>
                <option value="tv">TV-серіал</option>
                <option value="movie">Фільм</option>
                <option value="ova">OVA / ONA</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Відсортувати</label>
              <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} style={{ borderLeft: '3px solid var(--neon-accent)' }}>
                <option value="default">Останні оновлення</option>
                <option value="rating_desc">Найвищий рейтинг ★</option>
                <option value="title_asc">А-Я</option>
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
            const localAnime = data.find(a => String(a.anihubId) === String(animeId));

            const handleAction = (actionType, value = '0.0') => {
              if (localAnime) {
                if (actionType === 'favorite') onToggleFavorite(localAnime);
                if (actionType === 'watched') onToggleWatched(localAnime);
                if (actionType === 'planned') onTogglePlanned(localAnime);
                if (actionType === 'rating') onUpdateRating(localAnime, value);
                if (actionType === 'watching') onToggleWatching(localAnime);
              } else {
                const newAnime = {
                  anihubId: animeId,
                  titleUkrainian: title,
                  poster: anime.poster_url,
                  rating: anime.rating || '0.0',
                  description: anime.description_uk || anime.description || "Опис відсутній.",
                  year: anime.year,
                  episodesCount: anime.episodes_count || 0,
                  genres: anime.genres || [],
                  isFavorite: actionType === 'favorite',
                  isWatching: actionType === 'watching',
                  isWatched: actionType === 'watched',
                  planned: actionType === 'planned', 
                  userRating: actionType === 'rating' ? value : '0.0',
                  isAddedByUser: false
                };
                onAddAnime(newAnime);
              }
            };

            return (
              <AnimeCard 
                key={`top-${animeId}`}
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
    </section>
  );
};

export default TopAnimeList;