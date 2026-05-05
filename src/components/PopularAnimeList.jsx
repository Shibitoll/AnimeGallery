import React, { useState, useEffect } from 'react';
import AnimeCard from './AnimeCard';

const PopularAnimeList = ({ data, onAddAnime, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating, isHomePage }) => {
  const [popular, setPopular] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Фільтри, які йдуть на бекенд (щоб отримувати правильні сторінки)
  const [filters, setFilters] = useState({ type: '', rating: '' });
  
  // ВИКЛЮЧНО ФРОНТЕНД-СОРТУВАННЯ
  const [localSort, setLocalSort] = useState('default');

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        setIsLoading(true);
        let apiUrl = `http://localhost:8000/api/streaming/popular/?page=${page}`;
        if (filters.type) apiUrl += `&type=${filters.type}`;
        if (filters.rating) apiUrl += `&rating=${filters.rating}`;

        const response = await fetch(apiUrl);
        const result = await response.json();
        
        const animeList = result.results || [];
        setHasNextPage(result.hasNextPage || false);
        setTotalPages(result.totalPages || 1);

        const uniqueAnime = Array.from(new Map(animeList.map(item => [item.id, item])).values());
        setPopular(uniqueAnime); 
      } catch (err) {
        console.error("Помилка завантаження популярних:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopular();
  }, [page, filters]);

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
        return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title_desc':
        return sorted.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'rating_desc':
        return sorted.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      case 'rating_asc':
        return sorted.sort((a, b) => parseFloat(a.rating || 0) - parseFloat(b.rating || 0));
      case 'year_desc':
        return sorted.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      case 'year_asc': // Якщо року немає, кидаємо в кінець (9999)
        return sorted.sort((a, b) => (parseInt(a.year) || 9999) - (parseInt(b.year) || 9999));
      case 'episodes_desc':
        return sorted.sort((a, b) => (parseInt(b.episodes) || 0) - (parseInt(a.episodes) || 0));
      case 'episodes_asc':
        return sorted.sort((a, b) => {
          const epA = parseInt(a.episodes) || 9999;
          const epB = parseInt(b.episodes) || 9999;
          return epA - epB;
        });
      default:
        return sorted; // 'default' — зберігаємо порядок, як віддав API
    }
  };

  const baseAnimeList = isHomePage ? popular.slice(0, 10) : popular;
  const finalDisplayedAnime = getSortedAnime(baseAnimeList);

  return (
    <div className="api-section">
      
      {!isHomePage && (
        <div className="section-header">
          <h2 className="gallery-title" style={{ marginTop: 'var(--space-lg)', color: 'var(--text-primary)' }}>
            Найпопулярніші аніме у світі
          </h2>

          <div className="filters-container" style={{ marginBottom: '30px', justifyContent: 'flex-start' }}>
            <div className="filter-group">
              <label>Формат випуску</label>
              <select value={filters.type} onChange={(e) => { setFilters({...filters, type: e.target.value}); setPage(1); }}>
                <option value="">Усі формати</option>
                <option value="tv">TV-серіал (ТБ)</option>
                <option value="movie">Повнометражний фільм</option>
                <option value="ova">OVA / ONA</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Вікова категорія</label>
              <select value={filters.rating} onChange={(e) => { setFilters({...filters, rating: e.target.value}); setPage(1); }}>
                <option value="">Для будь-якого віку</option>
                <option value="g">G (Усі вікові категорії)</option>
                <option value="pg13">PG-13 (Для підлітків)</option>
                <option value="r17">R-17 (Дорослі теми)</option>
              </select>
            </div>

            {/* МЕНЮ ФРОНТЕНД-СОРТУВАННЯ */}
            <div className="filter-group">
              <label>Відсортувати</label>
              <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} style={{ borderLeft: '3px solid var(--neon-accent)' }}>
                <option value="default">ТОП MAL (Оригінал)</option>
                <optgroup label="За оцінкою">
                  <option value="rating_desc">Найкращі зверху (★)</option>
                  <option value="rating_asc">Найгірші зверху</option>
                </optgroup>
                <optgroup label="За алфавітом">
                  <option value="title_asc">А-Я (A-Z)</option>
                  <option value="title_desc">Я-А (Z-A)</option>
                </optgroup>
                <optgroup label="За датою">
                  <option value="year_desc">Найновіші спочатку</option>
                  <option value="year_asc">Найстаріші спочатку</option>
                </optgroup>
                <optgroup label="За тривалістю">
                  <option value="episodes_desc">Найдовші (багато серій)</option>
                  <option value="episodes_asc">Найкоротші</option>
                </optgroup>
              </select>
            </div>

            {(filters.type || filters.rating || localSort !== 'default') && (
              <button className="reset-filters-btn" onClick={() => { setFilters({ type: '', rating: '' }); setLocalSort('default'); setPage(1); }}>
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
            const title = anime.title;
            const animeId = anime.id;
            const localAnime = data.find(a => a.mal_id === String(animeId) || a.title === title);

            const handleAction = (actionType, value = '0.0') => {
              if (localAnime) {
                if (actionType === 'favorite') onToggleFavorite(localAnime.id);
                if (actionType === 'watched') onToggleWatched(localAnime.id);
                if (actionType === 'planned') onTogglePlanned(localAnime.id);
                if (actionType === 'rating') onUpdateRating(localAnime.id, value);
                if (actionType === 'watching') onToggleWatching(localAnime.id);
              } else {
                const newAnime = {
                  mal_id: String(animeId),
                  title: title || 'Без назви',
                  poster: anime.image || 'https://via.placeholder.com/225x320?text=No+Image',
                  rating: anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0',
                  description: anime.description || "Опис доступний на сторінці перегляду.",
                  year: String(anime.year || new Date().getFullYear()),
                  episodes: String(anime.episodes || 0),
                  studio: Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || 'Популярне'),
                  status: anime.status || 'Unknown',
                  genres: anime.genres?.length > 0 ? anime.genres.join(', ') : 'Популярне',
                  isFavorite: actionType === 'favorite',
                  isWatching: actionType === 'watching',
                  isWatched: actionType === 'watched',
                  planned: actionType === 'planned', 
                  userRating: actionType === 'rating' ? parseFloat(value || 0).toFixed(1) : '0.0',
                  isAddedByUser: false
                };
                onAddAnime(newAnime);
              }
            };

            return (
              <AnimeCard 
                key={`pop-${animeId}`}
                id={localAnime ? localAnime.id : animeId}
                mal_id={animeId}
                title={title}
                poster={anime.image}
                rating={anime.rating}
                description={''}
                year={anime.year || 'N/A'}
                episodes={anime.episodes || 0}
                studio={anime.studio || 'Популярне'}
                genres={anime.genres?.length > 0 ? anime.genres.join(', ') : 'Популярне'}
                isFavorite={localAnime ? localAnime.isFavorite : false}
                isWatching={localAnime ? localAnime.isWatching : false}
                isWatched={localAnime ? localAnime.isWatched : false}
                planned={localAnime ? localAnime.planned : false}
                userRating={localAnime ? localAnime.userRating : '0.0'}
                isAddedByUser={false}
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
          <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(1)} title="Перша">&laquo;</button>
          <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>&larr; Назад</button>
          <div className="page-numbers">
            {getPageNumbers().map(num => (
              <button key={num} className={`num-btn ${page === num ? 'active' : ''}`} onClick={() => handlePageChange(num)}>{num}</button>
            ))}
          </div>
          <button className="page-btn" disabled={page === totalPages || !hasNextPage} onClick={() => handlePageChange(page + 1)}>Вперед &rarr;</button>
          <button className="page-btn" disabled={page === totalPages || !hasNextPage} onClick={() => handlePageChange(totalPages)} title="Остання">&raquo;</button>
        </div>
      )}
    </div>
  );
};

export default PopularAnimeList;