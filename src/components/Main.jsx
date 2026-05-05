import React, { useState } from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';
import TopAnimeList from './TopAnimeList';
import PopularAnimeList from './PopularAnimeList';
import { Card } from './ui';

const Main = ({data, toggleFavorite, toggleWatching, toggleWatched, togglePlanned, currentTab, onAddAnime, onDeleteAnime, onUpdateRating }) => {
  
  // Локальний стейт для сортування і фільтрів у власних списках
  const [localSearch, setLocalSearch] = useState('');
  const [localType, setLocalType] = useState('');
  const [localAgeRating, setLocalAgeRating] = useState('');
  const [localSort, setLocalSort] = useState('default');

  // 🛡 Патерн для скидання фільтрів при переході на іншу вкладку
  const [prevTab, setPrevTab] = useState(currentTab);

  if (currentTab !== prevTab) {
    setPrevTab(currentTab);
    setLocalSearch('');
    setLocalType('');
    setLocalAgeRating('');
    setLocalSort('default');
  }

  const interactedAnime = data.filter(anime => 
    anime.is_favorite|| 
    anime.is_watching ||
    anime.in_watchlist || 
    anime.planned ||
    anime.is_added_by_user || 
    (anime.user_rating && anime.user_rating !== '0.0')
  );

  const totalInteracted = interactedAnime.length;
  const favoritesCount = data.filter(a => a.is_favorite).length;
  const watchingCount = data.filter(a => a.is_watching).length;
  const watchedCount = data.filter(a => a.in_watchlist).length;
  const plannedCount = data.filter(a => a.planned).length;

  const ratedAnime = data.filter(a => a.user_rating && a.user_rating !== '0.0');

  const avgUserRating = ratedAnime.length > 0 
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / ratedAnime.length).toFixed(1) 
    : '0.0';

  const avgGlobalRating = ratedAnime.length > 0
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.rating), 0) / ratedAnime.length).toFixed(1)
    : '0.0';

  const getYearLimits = (items) => {
    if (items.length === 0) return { oldest: '-', newest: '-' };
    const years = items.map(a => parseInt(a.year)).filter(y => !isNaN(y));
    return {
      oldest: years.length > 0 ? Math.min(...years) : '-',
      newest: years.length > 0 ? Math.max(...years) : '-'
    };
  };

  const favoriteItems = data.filter(a => a.is_favorite);
  const favoriteRated = favoriteItems.filter(a => a.user_rating && a.user_rating !== '0.0');
  const favYears = getYearLimits(favoriteItems);
  const favStats = {
    count: favoriteItems.length,
    userAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    globalAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    totalEpisodes: favoriteItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: favYears.oldest,
    newest: favYears.newest
  };

  const watchingItems = data.filter(a => a.is_watching);
  const watchingRated = watchingItems.filter(a => a.user_rating && a.user_rating !== '0.0');
  const watchingYears = getYearLimits(watchingItems);
  const watchingStats = {
    count: watchingItems.length,
    userAvg: watchingRated.length > 0 ? (watchingRated.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / watchingRated.length).toFixed(1) : '0.0',
    globalAvg: watchingRated.length > 0 ? (watchingRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / watchingRated.length).toFixed(1) : '0.0',
    totalEpisodes: watchingItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: watchingYears.oldest,
    newest: watchingYears.newest
  };
  
  const watchedItems = data.filter(a => a.in_watchlist);
  const watchedRated = watchedItems.filter(a => a.user_rating && a.user_rating !== '0.0');
  const watchedYears = getYearLimits(watchedItems);
  const watchedStats = {
    count: watchedItems.length,
    userAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / watchedRated.length).toFixed(1) : '0.0',
    globalAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / watchedRated.length).toFixed(1) : '0.0',
    totalEpisodes: watchedItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: watchedYears.oldest,
    newest: watchedYears.newest
  };

  const plannedItems = data.filter(a => a.planned);
  const plannedRated = plannedItems.filter(a => a.user_rating && a.user_rating !== '0.0');
  const plannedYears = getYearLimits(plannedItems);
  const plannedStats = {
    count: plannedItems.length,
    userAvg: plannedRated.length > 0 ? (plannedRated.reduce((sum, a) => sum + parseFloat(a.user_rating), 0) / plannedRated.length).toFixed(1) : '0.0',
    globalAvg: plannedRated.length > 0 ? (plannedRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / plannedRated.length).toFixed(1) : '0.0',
    totalEpisodes: plannedItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: plannedYears.oldest,
    newest: plannedYears.newest
  };

  const favoriteAnime = favoriteItems;
  const watchingAnime = watchingItems;
  const watchedAnime = watchedItems;
  const plannedAnime = plannedItems;
  const myAnimeList = data.filter(anime => anime.is_added_by_user);

  const apiProps = {
    data,
    onAddAnime,
    onToggleFavorite: toggleFavorite,
    onToggleWatching: toggleWatching,
    onToggleWatched: toggleWatched,
    onTogglePlanned: togglePlanned,
    onUpdateRating
  };

  // -------------------------------------------------------------
  // ЛОГІКА ОБРОБКИ ЛОКАЛЬНИХ СПИСКІВ (Фільтрація + Сортування)
  // -------------------------------------------------------------
  const processLocalAnime = (animeArray) => {
    let processed = [...animeArray];

    // 1. Пошук за назвою
    if (localSearch.trim()) {
      processed = processed.filter(a =>
        (a.title || '').toLowerCase().includes(localSearch.toLowerCase())
      );
    }

    // 2. Фільтр за форматом (якщо дані про формат є в базі, зазвичай вони в type або status)
    if (localType) {
      processed = processed.filter(a => 
        (a.type && a.type.toLowerCase() === localType.toLowerCase()) ||
        // Обхідний шлях, якщо тип не зберігається явно, але є в іншому полі
        (a.status && a.status.toLowerCase().includes(localType.toLowerCase()))
      );
    }

    // 3. Фільтр за віковим рейтингом (пошук ключових слів у рядку rating/age_rating)
    if (localAgeRating) {
      processed = processed.filter(a => {
        const rStr = (a.age_rating || a.rating || '').toLowerCase(); // Беремо будь-яке поле з рейтингом
        if (localAgeRating === 'g') return rStr === 'g' || rStr.includes('g -');
        if (localAgeRating === 'pg13') return rStr.includes('pg-13');
        if (localAgeRating === 'r17') return rStr.includes('r - 17') || rStr.includes('r+');
        return true;
      });
    }

    // 4. Сортування
    switch (localSort) {
      case 'date_asc': return processed.sort((a, b) => parseInt(a.id) - parseInt(b.id)); // Найстаріші (менший ID)
      case 'user_rating_desc': return processed.sort((a, b) => parseFloat(b.user_rating || 0) - parseFloat(a.user_rating || 0));
      case 'user_rating_asc': return processed.sort((a, b) => parseFloat(a.user_rating || 0) - parseFloat(b.user_rating || 0));
      case 'rating_desc': return processed.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
      case 'rating_asc': return processed.sort((a, b) => parseFloat(a.rating || 0) - parseFloat(b.rating || 0));
      case 'title_asc': return processed.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      case 'title_desc': return processed.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
      case 'year_desc': return processed.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
      case 'year_asc': return processed.sort((a, b) => (parseInt(a.year) || 9999) - (parseInt(b.year) || 9999));
      case 'episodes_desc': return processed.sort((a, b) => (parseInt(b.episodes) || 0) - (parseInt(a.episodes) || 0));
      case 'episodes_asc': return processed.sort((a, b) => (parseInt(a.episodes) || 9999) - (parseInt(b.episodes) || 9999));
      case 'default': 
      default:
        return processed.sort((a, b) => parseInt(b.id) - parseInt(a.id)); // За датою додавання (Найновіші - більший ID)
    }
  };

  // -------------------------------------------------------------
  // МЕНЮ ЛОКАЛЬНОГО СОРТУВАННЯ ТА ПОШУКУ
  // -------------------------------------------------------------
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
        <label>Вікова категорія</label>
        <select value={localAgeRating} onChange={(e) => setLocalAgeRating(e.target.value)}>
          <option value="">Для будь-якого віку</option>
          <option value="g">G (Усі вікові категорії)</option>
          <option value="pg13">PG-13 (Для підлітків)</option>
          <option value="r17">R-17 (Дорослі теми)</option>
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
          <optgroup label="За рейтингом системи (MAL)">
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

      {(localSearch || localType || localAgeRating || localSort !== 'default') && (
        <button className="reset-filters-btn" onClick={() => { setLocalSearch(''); setLocalType(''); setLocalAgeRating(''); setLocalSort('default'); }}>
          ✕ Скинути
        </button>
      )}
    </div>
  );

  const displayedFavorite = processLocalAnime(favoriteAnime);
  const displayedWatching = processLocalAnime(watchingAnime);
  const displayedWatched = processLocalAnime(watchedAnime);
  const displayedPlanned = processLocalAnime(plannedAnime);
  const displayedMyAnime = processLocalAnime(myAnimeList);

  return (
    <main className="main-content">

      {/* 1. ГОЛОВНА СТОРІНКА */}
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

          <h2 className="gallery-title">Популярні в світі <span className="title-badge">Топ-10</span></h2>
          <PopularAnimeList {...apiProps} isHomePage={true} />

          <h2 className="gallery-title">Новинки сезону</h2>
          <TopAnimeList {...apiProps} isHomePage={true} />

          {myAnimeList.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title">Мої додані аніме <span className="title-badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>{myAnimeList.length}</span></h2>
              <AnimeList 
                list={myAnimeList.slice(0, 10)} 
                onToggleFavorite={toggleFavorite}
                onToggleWatching={toggleWatching} 
                onToggleWatched={toggleWatched} 
                onTogglePlanned={togglePlanned} 
                onDeleteAnime={onDeleteAnime} 
                onUpdateRating={onUpdateRating} 
              />
            </div>
          )}
        </>
      )}

      {/* 2. СТОРІНКА ПОПУЛЯРНИХ */}
      {currentTab === 'popular' && (
        <>
          <PopularAnimeList {...apiProps} />
        </>
      )}

      {/* 3. СТОРІНКА УЛЮБЛЕНИХ */}
      {currentTab === 'favorite' && (
        <>
          <h2 className="gallery-title">Ваші улюблені аніме <span className="title-badge">{favoriteAnime.length}</span></h2>

          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info">
                <h4>Улюблених аніме</h4>
                <span className="stat-value">{favStats.count}</span>
                <p className="stat-desc">Тільки обрані</p>
              </div>
              <div className="stat-icon">❤️</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Середня оцінка (Ваша vs Система)</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#8b5cf6', margin: 0 }}>★ {favStats.userAvg}</span>
                    <p className="stat-desc">Ваша</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b', margin: 0 }}>★ {favStats.globalAvg}</span>
                    <p className="stat-desc">Системи</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Всього епізодів</h4>
                <span className="stat-value">{favStats.totalEpisodes}</span>
                <p className="stat-desc">У всіх улюблених</p>
              </div>
              <div className="stat-icon">📺</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>{favStats.oldest}</span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>{favStats.newest}</span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">📅</div>
            </Card>
          </section>

          {favoriteAnime.length > 0 && renderLocalControls()}

          {favoriteAnime.length > 0 ? (
            displayedFavorite.length > 0 ? (
              <AnimeList list={displayedFavorite} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            ) : (
              <p className="empty-message">За вашим запитом нічого не знайдено.</p>
            )
          ) : (
            <p className="empty-message">Список порожній. Додайте щось у серденько!</p>
          )}
        </>
      )}

      {/* 4. СТОРІНКА ДИВЛЮСЯ */}
      {currentTab === 'watching' && (
        <>
          <h2 className="gallery-title">Зараз дивлюся <span className="title-badge" style={{backgroundColor: '#3b82f6'}}>{watchingAnime.length}</span></h2>

          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info">
                <h4>В процесі</h4>
                <span className="stat-value">{watchingStats.count}</span>
                <p className="stat-desc">Дивитеся прямо зараз</p>
              </div>
              <div className="stat-icon">▶️</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Оцінка Системи</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b', margin: 0 }}>★ {watchingStats.globalAvg}</span>
                    <p className="stat-desc">Середній рейтинг MAL</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Всього епізодів</h4>
                <span className="stat-value">{watchingStats.totalEpisodes}</span>
                <p className="stat-desc">Годин насолоди</p>
              </div>
              <div className="stat-icon">🍿</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>{watchingStats.oldest}</span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>{watchingStats.newest}</span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">🕰️</div>
            </Card>
          </section>

          {watchingAnime.length > 0 && renderLocalControls()}

          {watchingAnime.length > 0 ? (
            displayedWatching.length > 0 ? (
              <AnimeList list={displayedWatching} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            ) : (
              <p className="empty-message">За вашим запитом нічого не знайдено.</p>
            )
          ) : (
            <p className="empty-message">Зараз ви нічого не дивитесь. Знайдіть щось цікаве!</p>
          )}
        </>
      )}

      {/* 5. СТОРІНКА ПЕРЕГЛЯНУТИХ */}
      {currentTab === 'watched' && (
        <>
          <h2 className="gallery-title">Переглянуті аніме <span className="title-badge">{watchedAnime.length}</span></h2>

          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info">
                <h4>Переглянуті аніме</h4>
                <span className="stat-value">{watchedStats.count}</span>
                <p className="stat-desc">Тільки переглянуті</p>
              </div>
              <div className="stat-icon">👁️</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Середня оцінка (Ваша vs Система)</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#8b5cf6', margin: 0 }}>★ {watchedStats.userAvg}</span>
                    <p className="stat-desc">Ваша</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b', margin: 0 }}>★ {watchedStats.globalAvg}</span>
                    <p className="stat-desc">Системи</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Всього епізодів</h4>
                <span className="stat-value">{watchedStats.totalEpisodes}</span>
                <p className="stat-desc">У всіх переглянутих</p>
              </div>
              <div className="stat-icon">📺</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>{watchedStats.oldest}</span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>{watchedStats.newest}</span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">📅</div>
            </Card>
          </section>

          {watchedAnime.length > 0 && renderLocalControls()}

          {watchedAnime.length > 0 ? (
            displayedWatched.length > 0 ? (
              <AnimeList list={displayedWatched} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            ) : (
              <p className="empty-message">За вашим запитом нічого не знайдено.</p>
            )
          ) : (
            <p className="empty-message">Ви ще нічого не переглянули повністю.</p>
          )}
        </>
      )}

      {/* 6. СТОРІНКА В ПЛАНАХ */}
      {currentTab === 'planned' && (
        <>
          <h2 className="gallery-title">Планую подивитись <span className="title-badge" style={{backgroundColor: 'var(--neon-accent, #3b82f6)'}}>{plannedItems.length}</span></h2>

          <section className="dashboard-stats">
            <Card className="stat-card">
              <div className="stat-info">
                <h4>В планах</h4>
                <span className="stat-value">{plannedStats.count}</span>
                <p className="stat-desc">Чекають на перегляд</p>
              </div>
              <div className="stat-icon">📅</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Очікувана якість (Оцінка Системи)</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b', margin: 0 }}>★ {plannedStats.globalAvg}</span>
                    <p className="stat-desc">Середній рейтинг MAL</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Попереду епізодів</h4>
                <span className="stat-value">{plannedStats.totalEpisodes}</span>
                <p className="stat-desc">Годин насолоди</p>
              </div>
              <div className="stat-icon">🍿</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>{plannedStats.oldest}</span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>{plannedStats.newest}</span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">🕰️</div>
            </Card>
          </section>

          {plannedItems.length > 0 && renderLocalControls()}

          {plannedItems.length > 0 ? (
            displayedPlanned.length > 0 ? (
              <AnimeList list={displayedPlanned} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            ) : (
               <p className="empty-message">За вашим запитом нічого не знайдено.</p>
            )
          ) : (
            <p className="empty-message">Ваш список планів порожній. Знайдіть щось цікаве в каталозі!</p>
          )}
        </>
      )}
      
      {/* 7. СТОРІНКА МОЇ АНІМЕ */}
      {currentTab === 'my-anime' && (
        <div className="my-anime-page">
          <Card className="my-anime-header" style={{ marginBottom: '40px', padding: '40px', background: 'linear-gradient(135deg, var(--text-primary) 0%, var(--card-border) 100%)', color: 'var(--bg-color)' }}>
            <h2>Твій особистий каталог</h2>
            <p>Додайте сюди тайтли, які запали вам у душу, щоб зберегти історію своїх переглядів. Ваш особистий всесвіт аніме починається тут!</p>
          </Card>

          <AddAnimeForm onAddAnime={onAddAnime} />

          {myAnimeList.length > 0 && (
            <div className="category-section" style={{ marginTop: '40px' }}>
              <h2 className="gallery-title">Додані вами аніме</h2>
              {renderLocalControls()}
              <AnimeList 
                list={displayedMyAnime} 
                onToggleFavorite={toggleFavorite}
                onToggleWatching={toggleWatching} 
                onToggleWatched={toggleWatched} 
                onTogglePlanned={togglePlanned} 
                onDeleteAnime={onDeleteAnime} 
                onUpdateRating={onUpdateRating} 
              />
            </div>
          )}
        </div>
      )}

      {currentTab === 'new' && (
        <>
          <TopAnimeList {...apiProps} />
        </>
      )}

    </main>
  );
}
export default Main;