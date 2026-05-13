import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AnimeCard from '../components/AnimeCard';
import '../styles/Search.css';

// Словник перекладу жанрів (Англійська -> Українська)
const GENRE_MAP = {
  "Action": "Екшен", "Adventure": "Пригоди", "Comedy": "Комедія", "Drama": "Драма", 
  "Fantasy": "Фентезі", "Horror": "Жахи", "Mecha": "Меха", "Mystery": "Детектив", 
  "Psychological": "Психологія", "Romance": "Романтика", "Sci-Fi": "Фантастика", 
  "Slice of Life": "Повсякденність", "Sports": "Спорт", "Supernatural": "Надприродне", 
  "Thriller": "Трилер", "Shounen": "Шьонен", "Shoujo": "Сьодзьо", "Seinen": "Сейнен", 
  "Isekai": "Ісекай", "Historical": "Історія", "School": "Школа", "Music": "Музика",
  "Demons": "Демони", "Vampire": "Вампіри", "Military": "Військове"
};

const AVAILABLE_GENRES = Object.keys(GENRE_MAP).sort();

const Search = ({ data, onAddAnime, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const navigate = useNavigate();

  const [localSearch, setLocalSearch] = useState(urlQuery);

  const [suggestions, setSuggestions] = useState([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const currentYear = new Date().getFullYear();
  
  // ФІЛЬТРИ
  const [filters, setFilters] = useState({
    type: '',       
    status: '',     
    ordering: '-rating',
    genres: [],
    genreMatch: 'any',
    yearFrom: 1970,
    yearTo: currentYear
  });

  const [rawApiResults, setRawApiResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 30;

  // Закриття підказок
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // БЕЗПЕЧНИЙ ЖИВИЙ ПОШУК
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
        const params = new URLSearchParams({ path: 'anime', search: localSearch.trim() });
        const response = await fetch(`http://127.0.0.1:8000/api/proxy/?${params.toString()}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            const items = data.items || data.results || (Array.isArray(data) ? data : []);
            setSuggestions(items.slice(0, 5));
        } else {
            setSuggestions([]);
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
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (animeId) => {
    navigate(`/anime/${animeId}`);
    setShowSuggestions(false);
    setLocalSearch('');
  };

  const handleResetFilters = () => {
    setFilters({ type: '', status: '', ordering: '-rating', genres: [], genreMatch: 'any', yearFrom: 1970, yearTo: currentYear });
    setPage(1);
    setLocalSearch('');
    setSearchParams({});
  };

  const toggleGenre = (genre) => {
    setFilters(prev => ({
      ...prev,
      genres: prev.genres.includes(genre) ? prev.genres.filter(g => g !== genre) : [...prev.genres, genre]
    }));
    setPage(1);
  };

  // 1. ЗАВАНТАЖЕННЯ ДАНИХ (АБСОЛЮТНО ЧИСТИЙ ЗАПИТ)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setIsLoading(true);
        
        // Формуємо максимально безпечний запит. 
        // Ніколи не надсилаємо `page`, `page_size` чи `ordering`, якщо є `search`.
        const params = new URLSearchParams({ path: 'anime' });
        
        if (urlQuery) {
          params.append('search', urlQuery);
        } else {
          // Якщо пошуку немає, просимо дефолтні 30 аніме
          params.append('page_size', '30');
        }

        const response = await fetch(`http://127.0.0.1:8000/api/proxy/?${params.toString()}`);
        
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            const resultData = await response.json();
            const items = resultData.items || resultData.results || (Array.isArray(resultData) ? resultData : []);
            
            // Видаляємо можливі дублікати за ID
            const uniqueAnime = Array.from(new Map(items.map(item => [item.id, item])).values());
            setRawApiResults(uniqueAnime);
        } else {
            setRawApiResults([]);
        }

      } catch (err) {
        console.error("Помилка завантаження каталогу:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSearchResults();
  }, [urlQuery]); // Запит летить ТІЛЬКИ коли змінюється рядок у браузері (?q=...)

  // 2. БРОНЕБІЙНА ЛОКАЛЬНА ФІЛЬТРАЦІЯ
  useEffect(() => {
    let filteredList = [...rawApiResults];

    // Фільтр: Формат
    if (filters.type) {
      filteredList = filteredList.filter(a => a.type?.toLowerCase() === filters.type.toLowerCase());
    }
    
    // Фільтр: Статус
    if (filters.status) {
      filteredList = filteredList.filter(a => a.status?.toLowerCase() === filters.status.toLowerCase());
    }

    // Фільтр: Рік
    filteredList = filteredList.filter(a => {
      const y = parseInt(a.year);
      if (!y) return true; // Якщо року немає, залишаємо
      return y >= filters.yearFrom && y <= filters.yearTo;
    });

    // Фільтр: Жанри
    if (filters.genres.length > 0) {
      filteredList = filteredList.filter(a => {
        if (!a.genres || !Array.isArray(a.genres)) return false;
        
        // Збираємо всі жанри аніме в один рядок
        const animeGenresStr = a.genres.map(g => {
          return (typeof g === 'object' ? (g.name || g.title_ukrainian || '') : String(g)).toLowerCase();
        }).join(' ');

        const isMatch = (selectedGenre) => {
          const engMatch = selectedGenre.toLowerCase();
          const ukrMatch = (GENRE_MAP[selectedGenre] || '').toLowerCase();
          return animeGenresStr.includes(engMatch) || animeGenresStr.includes(ukrMatch);
        };

        if (filters.genreMatch === 'all') {
          return filters.genres.every(isMatch);
        } else {
          return filters.genres.some(isMatch);
        }
      });
    }

    // Сортування (повністю локальне)
    filteredList.sort((a, b) => {
      if (filters.ordering === '-rating') return parseFloat(b.rating || 0) - parseFloat(a.rating || 0);
      if (filters.ordering === 'year') return parseInt(a.year || 9999) - parseInt(b.year || 9999);
      if (filters.ordering === '-year') return parseInt(b.year || 0) - parseInt(a.year || 0);
      return 0;
    });

    setDisplayedResults(filteredList);
  }, [rawApiResults, filters]); // Спрацьовує при завантаженні даних АБО зміні фільтрів

  useEffect(() => {
    setLocalSearch(urlQuery);
    setPage(1); // При новому пошуку скидаємо пагінацію
  }, [urlQuery]);

  // ПАГІНАЦІЯ (ЛОКАЛЬНА)
  const totalPages = Math.ceil(displayedResults.length / itemsPerPage) || 1;
  const validPage = Math.min(page, totalPages);
  const currentItems = displayedResults.slice((validPage - 1) * itemsPerPage, validPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageNumbers = () => {
    const maxVisible = 5;
    let start = Math.max(1, validPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const getTranslatedGenres = (genresList) => {
    if (!genresList || genresList.length === 0) return 'Різне';
    if (typeof genresList === 'string') return genresList; 
    return genresList.map(g => {
      const name = typeof g === 'object' ? g.name : g;
      return GENRE_MAP[name] || name;
    }).join(', ');
  };

  const yearsArray = Array.from({length: currentYear - 1969}, (_, i) => currentYear - i);

  return (
    <div className="search-page-container">
      <div className="search-header-box">
        <h1 className="search-main-title">Розширений пошук</h1>
        
        <div className="page-search-container" ref={searchRef} style={{ position: 'relative', width: '100%', maxWidth: '700px', margin: '0 auto' }}>
          <form onSubmit={handleSearchSubmit} className="page-search-form">
            <input 
              type="text" 
              placeholder="Введіть назву аніме (напр., Наруто)..." 
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              onFocus={() => localSearch.trim().length >= 3 && setShowSuggestions(true)}
              className="page-search-input"
              style={{ width: '100%' }}
            />
            <button type="submit" className="page-search-btn">Шукати</button>
          </form>

          {showSuggestions && localSearch.trim().length >= 3 && (
            <div className="suggestions-dropdown" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, marginTop: '8px', background: 'var(--surface-card, #1e293b)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
              {isSuggesting ? (
                <div className="suggestions-loading" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Шукаємо... ⏳</div>
              ) : suggestions.length > 0 ? (
                <>
                  {suggestions.map(anime => {
                    const title = anime.title_ukrainian || anime.title_english || anime.title_original || anime.title;
                    const poster = anime.image || anime.poster_url || 'https://via.placeholder.com/40x60?text=No+Image';
                    return (
                      <div 
                        key={`sugg-${anime.id}`} 
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(anime.id)}
                        style={{ display: 'flex', alignItems: 'center', padding: '10px 15px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <img 
                          src={poster} 
                          alt={title} 
                          style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginRight: '15px' }}
                        />
                        <div className="suggestion-info" style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{title}</span>
                          <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                            {anime.year || 'N/A'} • ★ {anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  <button onClick={handleSearchSubmit} style={{ width: '100%', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Показати всі результати для "{localSearch}" &rarr;
                  </button>
                </>
              ) : (
                <div className="suggestions-empty" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>Нічого не знайдено 😔</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="filters-container">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Формат випуску</label>
            <select value={filters.type} onChange={(e) => { setFilters({...filters, type: e.target.value}); setPage(1); }}>
              <option value="">Усі формати</option>
              <option value="tv">TV-серіал</option>
              <option value="movie">Фільм</option>
              <option value="ova">OVA</option>
              <option value="ona">ONA</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Статус виходу</label>
            <select value={filters.status} onChange={(e) => { setFilters({...filters, status: e.target.value}); setPage(1); }}>
              <option value="">Будь-який статус</option>
              <option value="ongoing">Онгоїнг (Виходить)</option>
              <option value="completed">Завершено</option>
              <option value="upcoming">Анонс</option>
            </select>
          </div>

          <div className="filter-group year-group">
            <label>Рік випуску</label>
            <div className="year-selects" style={{ display: 'flex', gap: '10px' }}>
              <select value={filters.yearFrom} onChange={(e) => { setFilters({...filters, yearFrom: parseInt(e.target.value)}); setPage(1); }} style={{flex: 1}}>
                {yearsArray.map(y => <option key={`from-${y}`} value={y}>Від {y}</option>)}
                <option value={1970}>Від 1970</option>
              </select>
              <select value={filters.yearTo} onChange={(e) => { setFilters({...filters, yearTo: parseInt(e.target.value)}); setPage(1); }} style={{flex: 1}}>
                {yearsArray.map(y => <option key={`to-${y}`} value={y}>До {y}</option>)}
              </select>
            </div>
          </div>

          <div className="filter-group">
            <label>Сортування</label>
            <select value={filters.ordering} onChange={(e) => { setFilters({...filters, ordering: e.target.value}); setPage(1); }}>
              <option value="-updated_at">За замовчуванням</option>
              <option value="-rating">Найвищий рейтинг ★</option>
              <option value="-year">Новинки (Рік)</option>
              <option value="year">Найстаріші</option>
            </select>
          </div>
        </div>

        {/* МУЛЬТИФІЛЬТР ЖАНРІВ */}
        <div className="filter-group genres-group" style={{ marginTop: '20px', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '15px' }}>
          <div className="genres-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <label>Жанри ({filters.genres.length} обрано)</label>
            <select 
              value={filters.genreMatch} 
              onChange={(e) => { setFilters({...filters, genreMatch: e.target.value}); setPage(1); }}
              style={{ padding: '4px 8px', fontSize: '12px', background: 'var(--surface-card)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px' }}
            >
              <option value="any">Хоча б один (АБО)</option>
              <option value="all">Точний збіг усіх (ТА)</option>
            </select>
          </div>
          
          <div className="genres-pill-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {AVAILABLE_GENRES.map(g => (
              <button 
                key={g}
                className={`genre-pill ${filters.genres.includes(g) ? 'active' : ''}`}
                onClick={() => toggleGenre(g)}
                style={{
                  padding: '8px 16px', borderRadius: '20px', 
                  background: filters.genres.includes(g) ? '#3b82f6' : 'transparent',
                  border: '1px solid #3b82f6',
                  color: filters.genres.includes(g) ? '#fff' : '#94a3b8',
                  cursor: 'pointer'
                }}
              >
                {GENRE_MAP[g]}
              </button>
            ))}
          </div>
        </div>

        {(filters.type || filters.status || filters.genres.length > 0 || filters.yearFrom !== 1970 || filters.yearTo !== currentYear || filters.ordering !== '-updated_at' || urlQuery) && (
          <button className="reset-filters-btn" onClick={handleResetFilters} style={{ marginTop: '20px', padding: '10px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer', width: '100%', maxWidth: '300px', alignSelf: 'center', display: 'block', margin: '20px auto 0' }}>
            ✕ Очистити пошук та фільтри
          </button>
        )}
      </div>

      {/* РЕЗУЛЬТАТИ */}
      {isLoading ? (
        <div className="loading-spinner" style={{ margin: '60px auto' }}></div>
      ) : displayedResults.length === 0 ? (
        <div className="empty-message" style={{ textAlign: 'center', padding: '40px', background: 'var(--surface-card)', borderRadius: '20px', color: '#94a3b8' }}>
          <p>За вашим запитом або фільтрами нічого не знайдено.</p>
        </div>
      ) : (
        <>
          <p className="results-counter" style={{ color: '#94a3b8', marginBottom: '20px' }}>
            Знайдено: <span className="highlight" style={{ color: '#fff', fontWeight: 'bold' }}>{displayedResults.length}</span> (сторінка {validPage} з {totalPages})
          </p>
          <div className="anime-grid">
            {currentItems.map((anime) => {
              const title = anime.title_ukrainian || anime.title_english || anime.title_original || anime.title;
              const animeId = anime.id;
              const poster = anime.poster_url || anime.image || anime.poster;
              const episodesCount = anime.episodes_count || anime.episodes || 0;

              const localAnime = data.find(a => String(a.anihubId) === String(animeId) || String(a.id) === String(animeId));

              const handleAction = (actionType, value = '0.0') => {
                if (localAnime) {
                  if (actionType === 'favorite') onToggleFavorite(localAnime.id);
                  if (actionType === 'watched') onToggleWatched(localAnime.id);
                  if (actionType === 'planned') onTogglePlanned(localAnime.id);
                  if (actionType === 'rating') onUpdateRating(localAnime.id, value);
                  if (actionType === 'watching') onToggleWatching(localAnime.id);
                } else {
                  const newAnime = {
                    anihubId: String(animeId),
                    titleUkrainian: title || 'Без назви',
                    poster: poster || 'https://via.placeholder.com/225x320?text=No+Image',
                    rating: anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0',
                    description: anime.description_uk || anime.description || "Опис доступний на сторінці перегляду.",
                    year: String(anime.year || currentYear),
                    episodesCount: String(episodesCount),
                    studio: Array.isArray(anime.studio) ? anime.studio.join(', ') : (anime.studio || 'Невідома'),
                    status: anime.status || 'Unknown',
                    genres: anime.genres || [],
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
                  titleUkrainian={title}
                  poster_url={poster}
                  rating={anime.rating}
                  description={''}
                  year={anime.year || 'N/A'}
                  episodesCount={episodesCount}
                  studio={anime.studio || 'Невідома'}
                  genres={getTranslatedGenres(anime.genres)}
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
              <button className="page-btn" disabled={validPage === 1} onClick={() => handlePageChange(1)}>&laquo;</button>
              <button className="page-btn" disabled={validPage === 1} onClick={() => handlePageChange(validPage - 1)}>&larr; Назад</button>
              
              <div className="page-numbers">
                {getPageNumbers().map(num => (
                  <button key={num} className={`num-btn ${validPage === num ? 'active' : ''}`} onClick={() => handlePageChange(num)}>
                    {num}
                  </button>
                ))}
              </div>

              <button className="page-btn" disabled={validPage === totalPages} onClick={() => handlePageChange(validPage + 1)}>Вперед &rarr;</button>
              <button className="page-btn" disabled={validPage === totalPages} onClick={() => handlePageChange(totalPages)}>&raquo;</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Search;