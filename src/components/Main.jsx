import React from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';
import TopAnimeList from './TopAnimeList';
import { Card } from './ui';

/**
 * Головний контентний компонент (Main).
 * * Відповідає за:
 * 1. Розрахунок глобальної та категоріальної статистики (середні рейтинги, лічильники епізодів).
 * 2. Фільтрацію загального масиву даних за вкладками (Home, Popular, Favorite, Watched, My Anime).
 * 3. Рендеринг відповідних секцій та списків аніме.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {Array<Object>} props.data - Повний масив об'єктів аніме з бази даних.
 * @param {Function} props.toggleFavorite - Обробник зміни статусу "улюблене".
 * @param {Function} props.toggleWatched - Обробник зміни статусу "переглянуто".
 * @param {string} props.currentTab - ID активної вкладки для перемикання контенту.
 * @param {Function} props.onAddAnime - Функція для створення нового запису аніме.
 * @param {Function} props.onDeleteAnime - Функція для видалення запису.
 * @param {Function} props.onUpdateRating - Функція для оновлення оцінки користувача.
 */
const Main = ({data, toggleFavorite, toggleWatched, currentTab, onAddAnime, onDeleteAnime, onUpdateRating }) => {
  

if (!data || data.length === 0) {
    return (
      <main className="main-content">
        <p>Завантаження даних або список порожній...</p>
      </main>
    );
  }
  
/** * @type {Array<Object>} interactedAnime - Аніме, з якими користувач взаємодіяв 
   * (лайкнув, подивився або оцінив).
   */
const interactedAnime = data.filter(anime => 
    anime.isFavorite || 
    anime.isWatched || 
    anime.isAddedByUser || 
    (anime.userRating && anime.userRating !== '0.0')
  );

/** @type {number} totalInteracted - Загальна кількість взаємодій користувача з тайтлами */
  const totalInteracted = interactedAnime.length;
/** @type {number} favoritesCount - Кількість аніме в списку улюблених */
  const favoritesCount = data.filter(a => a.isFavorite).length;
/** @type {number} watchedCount - Кількість аніме, відмічених як переглянуті */
  const watchedCount = data.filter(a => a.isWatched).length;


/** * @type {Array} ratedAnime - Список аніме, яким користувач виставив власну оцінку.
   */
  const ratedAnime = data.filter(a => a.userRating && a.userRating !== '0.0');

  const avgUserRating = ratedAnime.length > 0 
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / ratedAnime.length).toFixed(1) 
    : '0.0';

  const avgGlobalRating = ratedAnime.length > 0
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.rating), 0) / ratedAnime.length).toFixed(1)
    : '0.0';

/**
   * Допоміжна функція для визначення діапазону років випуску.
   * * @function getYearLimits
   * @memberof Main
   * @inner
   * @param {Array<Object>} items - Масив аніме для аналізу.
   * @returns {{oldest: (number|string), newest: (number|string)}} Об'єкт з межами років.
   */
  const getYearLimits = (items) => {
    if (items.length === 0) return { oldest: '-', newest: '-' };
    const years = items.map(a => parseInt(a.year)).filter(y => !isNaN(y));
    return {
      oldest: years.length > 0 ? Math.min(...years) : '-',
      newest: years.length > 0 ? Math.max(...years) : '-'
    };
  };

  
/** * Об'єкт статистики для вкладки "Улюблені".
   * @typedef {Object} StatsObj
   * @property {number} count - Кількість елементів.
   * @property {string} userAvg - Середня оцінка користувача.
   * @property {string} globalAvg - Середня оцінка системи.
   * @property {number} totalEpisodes - Сума епізодів усіх тайтлів секції.
   * @property {number|string} newest - Рік випуску найновішого тайтла.
   * @property {number|string} oldest - Рік випуску найстарішого тайтла.
   */

/** @type {StatsObj} favStats - Статистика для обраних аніме. */
const favoriteItems = data.filter(a => a.isFavorite);
  const favoriteRated = favoriteItems.filter(a => a.userRating && a.userRating !== '0.0');
  const favYears = getYearLimits(favoriteItems);
  
  const favStats = {
    count: favoriteItems.length,
    userAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    globalAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    totalEpisodes: favoriteItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: favYears.oldest,
    newest: favYears.newest
  };

  /** @type {StatsObj} watchedStats - Статистика для переглянутих аніме. */
const watchedItems = data.filter(a => a.isWatched);
  const watchedRated = watchedItems.filter(a => a.userRating && a.userRating !== '0.0');
  const watchedYears = getYearLimits(watchedItems);

  const watchedStats = {
    count: watchedItems.length,
    userAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / watchedRated.length).toFixed(1) : '0.0',
    globalAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / watchedRated.length).toFixed(1) : '0.0',
    totalEpisodes: watchedItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    oldest: watchedYears.oldest,
    newest: watchedYears.newest
  };

  const favoriteAnime = favoriteItems;
  const watchedAnime = watchedItems;
  const myAnimeList = data.filter(anime => anime.isAddedByUser);
  const popularAnime = data.filter(anime => !anime.isAddedByUser);

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
                <h4>Переглянуто</h4>
                <span className="stat-value">{watchedCount}</span>
                <p className="stat-desc">Завершених аніме</p>
              </div>
              <div className="stat-icon">✅</div>
            </Card>

            <Card className="stat-card">
              <div className="stat-info">
                <h4>Улюблені</h4>
                <span className="stat-value">{favoritesCount}</span>
                <p className="stat-desc">У серденьку</p>
              </div>
              <div className="stat-icon">❤️</div>
            </Card>
          </section>

          <h2 className="gallery-title">Популярні <span className="title-badge">Рейтинг 8.5+</span></h2>
          <AnimeList list={popularAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />

          <TopAnimeList />

          {myAnimeList.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title">Мої додані аніме <span className="title-badge" style={{ backgroundColor: '#10b981', color: '#fff' }}>{myAnimeList.length}</span></h2>
              <AnimeList list={myAnimeList} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            </div>
          )}
        </>
      )}

      {/* 2. СТОРІНКА ПОПУЛЯРНИХ */}
      {currentTab === 'popular' && (
        <>
          <h2 className="gallery-title">Усі популярні аніме <span className="title-badge">{data.length}</span></h2>
          <AnimeList list={popularAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
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

          {favoriteAnime.length > 0 ? (
            <AnimeList list={favoriteAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
          ) : (
            <p className="empty-message">Список порожній. Додайте щось у серденько!</p>
          )}
        </>
      )}

      {/* 4. СТОРІНКА ПЕРЕГЛЯНУТИХ */}
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

          {watchedAnime.length > 0 ? (
            <AnimeList list={watchedAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
          ) : (
            <p className="empty-message">Ви ще нічого не переглянули повністю.</p>
          )}
        </>
      )}

      {/* 5. СТОРІНКА МОЇ АНІМЕ */}
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
              <AnimeList list={myAnimeList} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating} />
            </div>
          )}
        </div>
      )}

    </main>
  );
}
export default Main;