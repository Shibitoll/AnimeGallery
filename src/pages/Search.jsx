import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import '../styles/Search.css';

const Search = ({ data, onAddAnime, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState(urlQuery);

  // СТАНИ ДЛЯ ЖИВОГО ПОШУКУ (ПІДКАЗОК)
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // РОЗШИРЕНІ ФІЛЬТРИ
  const [filters, setFilters] = useState({
    type: '',       
    status: '',     
    rating: '',       
    orderBy: 'popularity', 
    sort: 'desc'    
  });

  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Закриття підказок при кліку поза ними
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // МАГІЯ ЖИВОГО ПОШУКУ (Debounce для підказок)
  useEffect(() => {
    if (localSearch.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSuggesting(true);
      setShowSuggestions(true);
      try {
        const response = await fetch(`http://localhost:8000/api/streaming/search/?q=${encodeURIComponent(localSearch.trim())}`);
        const data = await response.json();
        
        if (data.results) {
          setSuggestions(data.results.slice(0, 5)); 
        }
      } catch (error) {
        console.error("Помилка підказок:", error);
      } finally {
        setIsSuggesting(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [localSearch]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ q: localSearch.trim() });
      setPage(1); 
      setShowSuggestions(false); // Ховаємо підказки при сабміті
    }
  };

  const handleSuggestionClick = (animeId) => {
    navigate(`/anime/${animeId}`);
    setShowSuggestions(false);
  };

  const handleResetFilters = () => {
    setFilters({ type: '', status: '', rating: '', orderBy: 'popularity', sort: 'desc' });
    setPage(1);
  };

  useEffect(() => {
    if (!urlQuery) return;

    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        let apiUrl = `http://localhost:8000/api/streaming/search/?q=${encodeURIComponent(urlQuery)}&page=${page}`;
        if (filters.type) apiUrl += `&type=${filters.type}`;
        if (filters.status) apiUrl += `&status=${filters.status}`;
        if (filters.rating) apiUrl += `&rating=${filters.rating}`;
        if (filters.orderBy) apiUrl += `&order_by=${filters.orderBy}`;
        if (filters.sort) apiUrl += `&sort=${filters.sort}`;

        const response = await fetch(apiUrl);
        const resultData = await response.json();
        
        const animeList = resultData.results || [];
        setHasNextPage(resultData.hasNextPage || false);
        setTotalPages(resultData.totalPages || 1);

        const uniqueAnime = Array.from(new Map(animeList.map(item => [item.id, item])).values());
        setResults(uniqueAnime); 
      } catch (err) {
        console.error("Помилка пошуку:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [urlQuery, page, filters]); 

  useEffect(() => {
    setLocalSearch(urlQuery);
    if (urlQuery) setPage(1);
  }, [urlQuery]);

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

  return (
    <div className="search-page-container">
      <div className="search-header-box">
        <h1 className="search-main-title">Розширений пошук</h1>
        
        {/* БЛОК ПОШУКУ З ПІДКАЗКАМИ */}
        <div className="page-search-container" ref={searchRef} style={{ position: 'relative', maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} className="page-search-form">
            <input 
              type="text" 
              placeholder="Введіть назву аніме (напр., Attack on Titan)..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onFocus={() => localSearch.trim().length >= 3 && setShowSuggestions(true)}
              className="page-search-input"
              style={{ width: '100%' }}
            />
            <button type="submit" className="page-search-btn">Шукати</button>
          </form>

          {/* ВИПАДАЮЧИЙ СПИСОК ПІДКАЗОК */}
          {showSuggestions && localSearch.trim().length >= 3 && (
            <div className="suggestions-dropdown" style={{ top: '100%', marginTop: '8px' }}>
              {isSuggesting ? (
                <div className="suggestions-loading">Шукаємо... ⏳</div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map(anime => (
                    <div 
                      key={anime.id} 
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(anime.id)}
                    >
                      <img 
                        src={anime.image || 'https://via.placeholder.com/40x60?text=No+Image'} 
                        alt={anime.title} 
                        className="suggestion-img"
                      />
                      <div className="suggestion-info">
                        <span className="suggestion-title">{anime.title}</span>
                        <span className="suggestion-meta" style={{ textAlign: 'left' }}>
                          {anime.year} • ★ {anime.rating ? parseFloat(anime.rating).toFixed(1) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                  <button className="suggestion-view-all" onClick={handleSearchSubmit}>
                    Показати всі результати для "{localSearch}" &rarr;
                  </button>
                </>
              ) : (
                <div className="suggestions-empty">Нічого не знайдено 😔</div>
              )}
            </div>
          )}
        </div>
      </div>

      {urlQuery && (
        <div className="filters-container">
          
          <div className="filter-group">
            <label>Формат випуску</label>
            <select value={filters.type} onChange={(e) => { setFilters({...filters, type: e.target.value}); setPage(1); }}>
              <option value="">Усі формати</option>
              <option value="tv">TV-серіал (ТБ)</option>
              <option value="movie">Повнометражний фільм</option>
              <option value="ova">OVA (Випуск на дисках)</option>
              <option value="ona">ONA (Web-реліз)</option>
              <option value="special">Спешл (Спецвипуск)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Статус виходу</label>
            <select value={filters.status} onChange={(e) => { setFilters({...filters, status: e.target.value}); setPage(1); }}>
              <option value="">Будь-який статус</option>
              <option value="airing">Онгоїнг (Виходить зараз)</option>
              <option value="complete">Завершено (Всі серії)</option>
              <option value="upcoming">Анонс (Ще не вийшло)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Вікова категорія</label>
            <select value={filters.rating} onChange={(e) => { setFilters({...filters, rating: e.target.value}); setPage(1); }}>
              <option value="">Для будь-якого віку</option>
              <option value="g">G (Усі вікові категорії)</option>
              <option value="pg13">PG-13 (Для підлітків)</option>
              <option value="r17">R-17 (Дорослі теми / Жорстокість)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Сортувати за</label>
            <select value={filters.orderBy} onChange={(e) => { setFilters({...filters, orderBy: e.target.value}); setPage(1); }}>
              <option value="popularity">Популярністю (найбільше фанатів)</option>
              <option value="score">Оцінкою глядачів (рейтингом)</option>
              <option value="start_date">Датою релізу (віком аніме)</option>
              <option value="episodes">Кількістю епізодів</option>
              <option value="title">Алфавітом (назвою)</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Порядок відображення</label>
            <select value={filters.sort} onChange={(e) => { setFilters({...filters, sort: e.target.value}); setPage(1); }}>
              <option value="desc">За спаданням (Найкращі/Нові зверху)</option>
              <option value="asc">За зростанням (Найгірші/Старі зверху)</option>
            </select>
          </div>

          <button className="reset-filters-btn" onClick={handleResetFilters} title="Скинути всі налаштування">
            ✕ Скинути
          </button>
        </div>
      )}

      {/* РЕЗУЛЬТАТИ */}
      {isLoading ? (
        <div className="loading-spinner" style={{ margin: '60px auto' }}></div>
      ) : !urlQuery ? (
        <div className="empty-search-prompt">
          <p>Використовуйте рядок вище, щоб знайти своє наступне улюблене аніме!</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-message">
          <p>За запитом <span className="highlight">"{urlQuery}"</span> нічого не знайдено (або контент приховано фільтром безпеки).</p>
        </div>
      ) : (
        <>
          <p className="results-counter">Знайдено результатів: сторінка {page} з {totalPages}</p>
          <div className="anime-grid">
            {results.map((anime) => {
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
                    studio: Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || 'Невідома'),
                    status: anime.status || 'Unknown',
                    genres: anime.genres?.length > 0 ? anime.genres.join(', ') : 'Різне',
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
                  key={`search-${animeId}`}
                  id={localAnime ? localAnime.id : animeId}
                  mal_id={animeId}
                  title={title}
                  poster={anime.image}
                  rating={anime.rating}
                  description={''}
                  year={anime.year || 'N/A'}
                  episodes={anime.episodes || 0}
                  studio={anime.studio || 'Невідома'}
                  genres={anime.genres?.length > 0 ? anime.genres.join(', ') : 'Різне'}
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

          {totalPages > 1 && (
            <div className="pagination-container">
              <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
              <button className="page-btn" disabled={page === 1} onClick={() => handlePageChange(page - 1)}>&larr; Назад</button>
              
              <div className="page-numbers">
                {getPageNumbers().map(num => (
                  <button key={num} className={`num-btn ${page === num ? 'active' : ''}`} onClick={() => handlePageChange(num)}>
                    {num}
                  </button>
                ))}
              </div>

              <button className="page-btn" disabled={page === totalPages || !hasNextPage} onClick={() => handlePageChange(page + 1)}>Вперед &rarr;</button>
              <button className="page-btn" disabled={page === totalPages || !hasNextPage} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;