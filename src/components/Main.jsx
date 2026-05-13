import React, { useState, useEffect } from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';
import TopAnimeList from './TopAnimeList';
import PopularAnimeList from './PopularAnimeList';
import { Card } from './ui';

const Main = ({
  data, 
  recommendedData = [], 
  toggleFavorite, 
  toggleWatching, 
  toggleWatched, 
  togglePlanned, 
  currentTab, 
  onAddAnime, 
  onDeleteAnime, 
  onUpdateRating 
}) => {
  
  const [localSearch, setLocalSearch] = useState('');
  const [localType, setLocalType] = useState('');
  const [localSort, setLocalSort] = useState('default');

  // === НОВІ СТАНИ ДЛЯ API-КАТАЛОГІВ (Популярні / Новинки) ===
  const [apiResults, setApiResults] = useState([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiPage, setApiPage] = useState(1);
  const [apiType, setApiType] = useState('');
  const [apiStatus, setApiStatus] = useState('');
  const [apiSort, setApiSort] = useState('');

  const [prevTab, setPrevTab] = useState(currentTab);

  if (currentTab !== prevTab) {
    setPrevTab(currentTab);
    // Скидаємо локальні фільтри
    setLocalSearch('');
    setLocalType('');
    setLocalSort('default');
    
    // Скидаємо фільтри API при перемиканні вкладок
    setApiType('');
    setApiStatus('');
    setApiSort('');
    setApiPage(1);
    setApiResults([]);
  }

  // === ЛОГІКА СИНХРОНІЗАЦІЇ РЕКОМЕНДАЦІЙ З ЛОКАЛЬНОЮ БАЗОЮ ===
  const mergedRecommendations = recommendedData.map(recItem => {
    // Шукаємо збіг за anihubId (пріоритетно) або за mal_id
    const localMatch = data.find(local => 
      (local.anihubId && String(local.anihubId) === String(recItem.anihubId)) ||
      (local.mal_id && String(local.mal_id) === String(recItem.mal_id))
    );
    // Якщо знайшли в базі — використовуємо локальний об'єкт (де є статуси лайків), інакше — оригінал
    return localMatch ? localMatch : recItem;
  });

  // === ЛОГІКА ЗАВАНТАЖЕННЯ З ПРОКСІ (AniHub) ===
  useEffect(() => {
    if (currentTab !== 'popular' && currentTab !== 'new') return;

    const fetchApiData = async () => {
      setApiLoading(true);
      try {
        const params = new URLSearchParams({
          path: 'anime',
          page: apiPage,
          page_size: 20 
        });

        if (apiType) params.append('type', apiType);

        let currentStatus = apiStatus;
        let currentSort = apiSort;

        if (currentTab === 'new' && !apiStatus && !apiSort) {
            currentStatus = 'ongoing';
            currentSort = '-updated_at';
        } else if (currentTab === 'popular' && !apiSort) {
            currentSort = '-rating';
        }

        if (currentStatus) params.append('status', currentStatus);
        if (currentSort) params.append('ordering', currentSort);

        const response = await fetch(`http://127.0.0.1:8000/api/proxy/?${params.toString()}`);
        if (response.ok) {
          const resultData = await response.json();
          const items = resultData.items || resultData.results || (Array.isArray(resultData) ? resultData : []);
          setApiResults(items);
        } else {
          console.error("Помилка API AniHub:", response.status);
          setApiResults([]);
        }
      } catch (err) {
        console.error("Помилка завантаження каталогу:", err);
      } finally {
        setApiLoading(false);
      }
    };

    const timer = setTimeout(() => fetchApiData(), 150);
    return () => clearTimeout(timer);
  }, [currentTab, apiPage, apiType, apiStatus, apiSort]);

  // Злиття результатів API з локальною базою
  const apiListMerged = apiResults.map(apiItem => {
    const apiId = String(apiItem.id);
    const localMatch = data.find(a => String(a.anihubId) === apiId || String(a.mal_id) === apiId || String(a.id) === apiId);
    
    if (localMatch) return localMatch;

    return {
      id: apiItem.id,
      anihubId: apiId,
      mal_id: apiId, 
      titleUkrainian: apiItem.title_ukrainian || apiItem.title_english || apiItem.title || 'Без назви',
      poster: apiItem.poster_url || apiItem.image || 'https://via.placeholder.com/225x318',
      rating: apiItem.rating ? parseFloat(apiItem.rating).toFixed(1) : '0.0',
      year: String(apiItem.year || '-'),
      episodesCount: String(apiItem.episodes_count || apiItem.episodes || 0),
      genres: apiItem.genres || [],
      description: apiItem.description_uk || apiItem.description || 'Опис відсутній',
      type: apiItem.type || 'tv',
      status: apiItem.status || 'completed',
      
      is_favorite: false,
      is_watching: false,
      in_watchlist: false,
      planned: false,
      user_rating: '0.0',
      isAddedByUser: false
    };
  });

  // --- ВИПРАВЛЕНА СТАТИСТИКА (ВИКОРИСТОВУЄМО snake_case) ---
  const interactedAnime = data.filter(anime => 
    anime.is_favorite || anime.is_watching || anime.in_watchlist || anime.planned || anime.isAddedByUser
  );

  const totalInteracted = interactedAnime.length;
  const favoritesCount = data.filter(a => a.is_favorite).length;
  const watchingCount = data.filter(a => a.is_watching).length;
  const watchedCount = data.filter(a => a.in_watchlist).length;
  const plannedCount = data.filter(a => a.planned).length;

  const userRatedAnime = data.filter(a => parseFloat(a.user_rating) > 0);
  const avgUserRating = userRatedAnime.length > 0 
    ? (userRatedAnime.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / userRatedAnime.length).toFixed(1) 
    : '0.0';

  const systemRatedAnime = data.filter(a => parseFloat(a.rating) > 0);
  const avgGlobalRating = systemRatedAnime.length > 0
    ? (systemRatedAnime.reduce((sum, a) => sum + parseFloat(a.rating), 0) / systemRatedAnime.length).toFixed(1)
    : '0.0';

  const getYearLimits = (items) => {
    if (items.length === 0) return { oldest: '-', newest: '-' };
    const years = items.map(a => parseInt(a.year)).filter(y => !isNaN(y));
    return {
      oldest: years.length > 0 ? Math.min(...years) : '-',
      newest: years.length > 0 ? Math.max(...years) : '-'
    };
  };

  const generateStats = (items) => {
    const userRated = items.filter(a => parseFloat(a.user_rating) > 0);
    const sysRated = items.filter(a => parseFloat(a.rating) > 0);
    const years = getYearLimits(items);
    
    return {
      count: items.length,
      userAvg: userRated.length > 0 ? (userRated.reduce((s, a) => s + parseFloat(a.user_rating), 0) / userRated.length).toFixed(1) : '0.0',
      globalAvg: sysRated.length > 0 ? (sysRated.reduce((s, a) => s + parseFloat(a.rating), 0) / sysRated.length).toFixed(1) : '0.0',
      totalEpisodes: items.reduce((s, a) => s + (parseInt(a.episodesCount) || 0), 0),
      oldest: years.oldest,
      newest: years.newest
    };
  };

  const favoriteItems = data.filter(a => a.is_favorite);
  const watchingItems = data.filter(a => a.is_watching);
  const watchedItems = data.filter(a => a.in_watchlist);
  const plannedItems = data.filter(a => a.planned);
  const myAnimeList = data.filter(anime => anime.isAddedByUser);

  const favStats = generateStats(favoriteItems);
  const watchingStats = generateStats(watchingItems);
  const watchedStats = generateStats(watchedItems);
  const plannedStats = generateStats(plannedItems);

  const apiProps = {
    data,
    onAddAnime,
    onToggleFavorite: toggleFavorite,
    onToggleWatching: toggleWatching,
    onToggleWatched: toggleWatched,
    onTogglePlanned: togglePlanned,
    onUpdateRating
  };

  const processLocalAnime = (animeArray) => {
    let processed = [...animeArray];

    if (localSearch.trim()) {
      processed = processed.filter(a =>
        (a.titleUkrainian || a.title || '').toLowerCase().includes(localSearch.toLowerCase())
      );
    }

    if (localType) {
      processed = processed.filter(a => 
        (a.type && a.type.toLowerCase() === localType.toLowerCase()) ||
        (a.status && a.status.toLowerCase().includes(localType.toLowerCase()))
      );
    }

    switch (localSort) {
      case 'date_asc': return processed.sort((a, b) => parseInt(a.id) - parseInt(b.id)); 
      case 'user_rating_desc': return processed.sort((a, b) => parseFloat(b.user_rating || 0) - parseFloat(a.user_rating || 0));
      case 'user_rating_asc': return processed.sort((a, b) => parseFloat(a.user_rating || 0) - parseFloat(b.user_rating || 0));
      case 'rating_desc': return processed.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      case 'rating_asc': return processed.sort((a, b) => parseFloat(a.rating || 0) - parseFloat(b.rating || 0));
      case 'title_asc': return processed.sort((a, b) => (a.titleUkrainian || a.title || '').localeCompare(b.titleUkrainian || b.title || ''));
      case 'title_desc': return processed.sort((a, b) => (b.titleUkrainian || b.title || '').localeCompare(a.titleUkrainian || a.title || ''));
      case 'year_desc': return processed.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      case 'year_asc': return processed.sort((a, b) => (parseInt(a.year) || 9999) - (parseInt(b.year) || 9999));
      case 'episodes_desc': return processed.sort((a, b) => (parseInt(b.episodesCount) || 0) - (parseInt(a.episodesCount) || 0));
      case 'episodes_asc': return processed.sort((a, b) => (parseInt(a.episodesCount) || 9999) - (parseInt(b.episodesCount) || 9999));
      case 'default': 
      default:
        return processed.sort((a, b) => parseInt(b.id) - parseInt(a.id)); 
    }
  };

  const renderLocalControls = () => (
    <div className="filters-container" style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end' }}>
      
      <div className="filter-group">
        <label>Пошук у списку</label>
        <input
          type="text"
          placeholder="Назва аніме..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
        />
      </div>

      <div className="filter-group">
        <label>Формат випуску</label>
        <select value={localType} onChange={(e) => setLocalType(e.target.value)}>
          <option value="">Усі формати</option>
          <option value="tv">TV-серіал (ТБ)</option>
          <option value="movie">Повнометражний фільм</option>
          <option value="ova">OVA / ONA</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Відсортувати</label>
        <select value={localSort} onChange={(e) => setLocalSort(e.target.value)} style={{ borderLeft: '3px solid var(--neon-accent)' }}>
          <optgroup label="За датою додавання (Історія)">
            <option value="default">Останні додані (Новіші)</option>
            <option value="date_asc">Давно додані (Старіші)</option>
          </optgroup>
          <optgroup label="За Вашою оцінкою">
            <option value="user_rating_desc">Найкращі (★)</option>
            <option value="user_rating_asc">Найгірші</option>
          </optgroup>
          <optgroup label="За рейтингом системи">
            <option value="rating_desc">Високий рейтинг</option>
            <option value="rating_asc">Низький рейтинг</option>
          </optgroup>
          <optgroup label="За алфавітом">
            <option value="title_asc">А-Я (A-Z)</option>
            <option value="title_desc">Я-А (Z-A)</option>
          </optgroup>
          <optgroup label="За датою виходу">
            <option value="year_desc">Новинки (за роком)</option>
            <option value="year_asc">Класика (за роком)</option>
          </optgroup>
          <optgroup label="За тривалістю">
            <option value="episodes_desc">Найдовші (багато серій)</option>
            <option value="episodes_asc">Найкоротші</option>
          </optgroup>
        </select>
      </div>

      {(localSearch || localType || localSort !== 'default') && (
        <button className="reset-filters-btn" onClick={() => { setLocalSearch(''); setLocalType(''); setLocalSort('default'); }}>
          ✕ Скинути
        </button>
      )}
    </div>
  );

  const renderApiControls = () => (
    <div className="filters-container" style={{ marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'flex-end', background: 'var(--surface-card)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="filter-group">
        <label>Формат випуску</label>
        <select value={apiType} onChange={(e) => { setApiType(e.target.value); setApiPage(1); }}>
          <option value="">Усі формати</option>
          <option value="tv">TV-серіал (ТБ)</option>
          <option value="movie">Фільм</option>
          <option value="ova">OVA</option>
          <option value="ona">ONA</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Статус виходу</label>
        <select value={apiStatus} onChange={(e) => { setApiStatus(e.target.value); setApiPage(1); }}>
          <option value="">Будь-який статус</option>
          <option value="ongoing">Онгоїнг (Виходить)</option>
          <option value="completed">Завершено</option>
          <option value="upcoming">Анонс</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Сортування</label>
        <select value={apiSort} onChange={(e) => { setApiSort(e.target.value); setApiPage(1); }} style={{ borderLeft: '3px solid var(--neon-accent)' }}>
          <option value="">За замовчуванням (Топ)</option>
          <option value="-rating">Найвищий рейтинг ★</option>
          <option value="-updated_at">Останні оновлення</option>
          <option value="-year">Рік (Спочатку нові)</option>
          <option value="year">Рік (Спочатку старі)</option>
        </select>
      </div>

      {(apiType || apiStatus || apiSort) && (
        <button className="reset-filters-btn" onClick={() => { setApiType(''); setApiStatus(''); setApiSort(''); setApiPage(1); }}>
          ✕ Скинути
        </button>
      )}
    </div>
  );

  const renderApiPagination = () => (
    <div className="pagination-container" style={{ marginTop: '30px', display: 'flex', justifyContent: 'center', gap: '15px', alignItems: 'center' }}>
      <button className="page-btn" disabled={apiPage === 1} onClick={() => { setApiPage(prev => prev - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>&larr; Назад</button>
      <span className="page-numbers" style={{ color: 'white', padding: '10px 20px', fontWeight: 'bold', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>Сторінка {apiPage}</span>
      <button className="page-btn" disabled={apiResults.length < 20} onClick={() => { setApiPage(prev => prev + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Вперед &rarr;</button>
    </div>
  );


  const displayedFavorite = processLocalAnime(favoriteItems);
  const displayedWatching = processLocalAnime(watchingItems);
  const displayedWatched = processLocalAnime(watchedItems);
  const displayedPlanned = processLocalAnime(plannedItems);
  const displayedMyAnime = processLocalAnime(myAnimeList);

  return (
    <main className="main-content">

      {currentTab === 'home' && (
        <>
          <section className="welcome-section">
            <h1>Ласкаво просимо до AnimeGallery</h1>
            <p>Відкрийте для себе найкращі аніме, оцінюйте та створюйте власну колекцію.</p>
          </section>

          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info">
                <h4>Ваш каталог</h4>
                <span className="stat-value">{totalInteracted}</span>
                <p className="stat-desc">Збережених тайтлів</p>
              </div>
              <div className="stat-icon">📚</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Оцінка (Ваша vs Система)</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#8b5cf6' }}>
                      ★ {avgUserRating}
                    </span>
                    <p className="stat-desc">Ваша</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>
                      ★ {avgGlobalRating}
                    </span>
                    <p className="stat-desc">Системи</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Улюблені</h4>
                <span className="stat-value">{favoritesCount}</span>
                <p className="stat-desc">У серденьку</p>
              </div>
              <div className="stat-icon">❤️</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Переглянуто</h4>
                <span className="stat-value">{watchedCount}</span>
                <p className="stat-desc">Завершених аніме</p>
              </div>
              <div className="stat-icon">✅</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Дивлюся</h4>
                <span className="stat-value">{watchingCount}</span>
                <p className="stat-desc">В процесі</p>
              </div>
              <div className="stat-icon">▶️</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>В планах</h4>
                <span className="stat-value">{plannedCount}</span>
                <p className="stat-desc">Чекають на перегляд</p>
              </div>
              <div className="stat-icon">📅</div>
            </Card>

          </section>

          {/* ВИПРАВЛЕНО: Секція рекомендацій тепер використовує mergedRecommendations */}
          {recommendedData && recommendedData.length > 0 && (
            <div className="category-section" style={{ marginTop: '30px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%)', padding: '10px 20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                <h2 className="gallery-title" style={{ margin: 0, border: 'none', padding: 0 }}>✨ Рекомендовано для вас</h2>
              </div>
              <AnimeList list={mergedRecommendations.slice(0, 10)} {...apiProps} />
            </div>
          )}

          <h2 className="gallery-title">Популярні в світі <span className="title-badge">Топ-10</span></h2>
          <PopularAnimeList {...apiProps} isHomePage={true} />

          <h2 className="gallery-title">Новинки сезону</h2>
          <TopAnimeList {...apiProps} isHomePage={true} />

          {myAnimeList.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title">Мої додані аніме <span className="title-badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>{myAnimeList.length}</span></h2>
              <AnimeList list={myAnimeList.slice(0, 10)} {...apiProps} />
            </div>
          )}
        </>
      )}

      {currentTab === 'popular' && (
        <div className="api-catalog-section">
          <h2 className="gallery-title">🔥 Найпопулярніші аніме</h2>
          {renderApiControls()}
          {apiLoading ? <div className="loading-spinner" style={{ margin: '60px auto' }}></div> : (
            <>
              <AnimeList list={apiListMerged} {...apiProps} />
              {renderApiPagination()}
            </>
          )}
        </div>
      )}

      {currentTab === 'new' && (
        <div className="api-catalog-section">
          <h2 className="gallery-title">🌟 Каталог новинок</h2>
          {renderApiControls()}
          {apiLoading ? <div className="loading-spinner" style={{ margin: '60px auto' }}></div> : (
            <>
              <AnimeList list={apiListMerged} {...apiProps} />
              {renderApiPagination()}
            </>
          )}
        </div>
      )}

      {currentTab === 'favorite' && (
        <>
          <h2 className="gallery-title">Ваші улюблені аніме <span className="title-badge">{favoriteItems.length}</span></h2>
          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info"><h4>Улюблені</h4><span className="stat-value">{favStats.count}</span></div>
              <div className="stat-icon">❤️</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-info"><h4>Середня оцінка</h4><span className="stat-value">★ {favStats.userAvg}</span></div>
            </Card>
          </section>
          {renderLocalControls()}
          {favoriteItems.length > 0 ? (
            displayedFavorite.length > 0 ? <AnimeList list={displayedFavorite} {...apiProps} /> : <p className="empty-message">Нічого не знайдено.</p>
          ) : <p className="empty-message">Список порожній.</p>}
        </>
      )}

      {currentTab === 'watching' && (
        <>
          <h2 className="gallery-title">Зараз дивлюся <span className="title-badge">{watchingItems.length}</span></h2>
          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info"><h4>В процесі</h4><span className="stat-value">{watchingStats.count}</span></div>
              <div className="stat-icon">▶️</div>
            </Card>
          </section>
          {renderLocalControls()}
          {watchingItems.length > 0 ? (
            displayedWatching.length > 0 ? <AnimeList list={displayedWatching} {...apiProps} /> : <p className="empty-message">Нічого не знайдено.</p>
          ) : <p className="empty-message">Зараз ви нічого не дивитесь.</p>}
        </>
      )}

      {currentTab === 'watched' && (
        <>
          <h2 className="gallery-title">Переглянуті аніме <span className="title-badge">{watchedItems.length}</span></h2>
          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info"><h4>Переглянуто</h4><span className="stat-value">{watchedStats.count}</span></div>
              <div className="stat-icon">✅</div>
            </Card>
            <Card className="stat-card">
              <div className="stat-info"><h4>Середня оцінка</h4><span className="stat-value">★ {watchedStats.userAvg}</span></div>
            </Card>
          </section>
          {renderLocalControls()}
          {watchedItems.length > 0 ? (
            displayedWatched.length > 0 ? <AnimeList list={displayedWatched} {...apiProps} /> : <p className="empty-message">Нічого не знайдено.</p>
          ) : <p className="empty-message">Ви ще нічого не переглянули.</p>}
        </>
      )}

      {currentTab === 'planned' && (
        <>
          <h2 className="gallery-title">Планую подивитись <span className="title-badge">{plannedItems.length}</span></h2>
          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info"><h4>В планах</h4><span className="stat-value">{plannedStats.count}</span></div>
              <div className="stat-icon">📅</div>
            </Card>
          </section>
          {renderLocalControls()}
          {plannedItems.length > 0 ? (
            displayedPlanned.length > 0 ? <AnimeList list={displayedPlanned} {...apiProps} /> : <p className="empty-message">Нічого не знайдено.</p>
          ) : <p className="empty-message">Ваш список планів порожній.</p>}
        </>
      )}
      
      {currentTab === 'my-anime' && (
        <div className="my-anime-page">
          <Card className="my-anime-header" style={{ marginBottom: '40px', padding: '40px', background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--card-border) 100%)', color: 'var(--bg-color)' }}>
            <h2>Твій особистий каталог</h2>
            <p>Додайте сюди тайтли, які запали вам у душу.</p>
          </Card>
          <AddAnimeForm onAddAnime={onAddAnime} />
          {myAnimeList.length > 0 && (
            <div className="category-section" style={{ marginTop: '40px' }}>
              <h2 className="gallery-title">Додані вами аніме</h2>
              {renderLocalControls()}
              <AnimeList list={displayedMyAnime} {...apiProps} />
            </div>
          )}
        </div>
      )}

    </main>
  );
}

export default Main;