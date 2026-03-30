import React from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';
import TopAnimeList from './TopAnimeList';

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

/** * @type {string} avgUserRating - Середня оцінка користувача (округлена до 1 знака).
   */
  const avgUserRating = ratedAnime.length > 0 
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / ratedAnime.length).toFixed(1) 
    : '0.0';

/** * @type {string} avgGlobalRating - Середня глобальна оцінка системи для тих самих тайтлів, 
   * які оцінив користувач.
   */
  const avgGlobalRating = ratedAnime.length > 0
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.rating), 0) / ratedAnime.length).toFixed(1)
    : '0.0';

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
  
  const favStats = {
    count: favoriteItems.length,
    userAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    globalAvg: favoriteRated.length > 0 ? (favoriteRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / favoriteRated.length).toFixed(1) : '0.0',
    totalEpisodes: favoriteItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    newest: favoriteItems.length > 0 ? Math.max(...favoriteItems.map(a => parseInt(a.year))) : '-',
    oldest: favoriteItems.length > 0 ? Math.min(...favoriteItems.map(a => parseInt(a.year))) : '-'
  };

  /** @type {StatsObj} watchedStats - Статистика для переглянутих аніме. */
  const watchedItems = data.filter(a => a.isWatched);
  const watchedRated = watchedItems.filter(a => a.userRating && a.userRating !== '0.0');

  const watchedStats = {
    count: watchedItems.length,
    userAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / watchedRated.length).toFixed(1) : '0.0',
    globalAvg: watchedRated.length > 0 ? (watchedRated.reduce((sum, a) => sum + parseFloat(a.rating), 0) / watchedRated.length).toFixed(1) : '0.0',
    totalEpisodes: watchedItems.reduce((sum, a) => sum + (parseInt(a.episodes) || 0), 0),
    newest: watchedItems.length > 0 ? Math.max(...watchedItems.map(a => parseInt(a.year))) : '-',
    oldest: watchedItems.length > 0 ? Math.min(...watchedItems.map(a => parseInt(a.year))) : '-'
  };

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
      oldest: Math.min(...years),
      newest: Math.max(...years)
    };
  };

  // Отримуємо значення для відповідних вкладок
  const favYears = getYearLimits(data.filter(a => a.isFavorite));
  const watchedYears = getYearLimits(data.filter(a => a.isWatched));

  const favoriteAnime = data.filter(anime => anime.isFavorite);
  const watchedAnime = data.filter(anime => anime.isWatched);

  const myAnimeList = data.filter(anime => anime.isAddedByUser);
  const popularAnime = data.filter(anime => !anime.isAddedByUser);

  return (
    <main className="main-content">

    {/* Для відображення на головній сторінці */}
      {currentTab === 'home' && (
        <>
          <section className="welcome-section">
            <h1>Ласкаво просимо до AnimeGallery</h1>
            <p>Відкрийте для себе найкращі аніме, оцінюйте та створюйте власну колекцію.</p>
          </section>
           
          {/* НОВА СЕКЦІЯ СТАТИСТИКИ */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-info">
              <h4>Ваш каталог</h4>
              <span className="stat-value">{totalInteracted}</span>
              <p className="stat-desc">Збережених тайтлів</p>
            </div>
            <div className="stat-icon">📚</div>
          </div>

          <div className="stat-card">
            <div className="stat-info" style={{ width: '100%' }}>
              <h4>Оцінка (Ваша vs Система)</h4>
              <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                {/* Ваша оцінка */}
                <div>
                  <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#8b5cf6' }}>
                    ★ {avgUserRating}
                  </span>
                  <p className="stat-desc">Ваша</p>
                </div>
                
                {/* Вертикальна лінія-розділювач */}
                <div style={{ width: '1px', background: '#e2e8f0' }}></div>

                {/* Оцінка системи */}
                <div>
                  <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>
                    ★ {avgGlobalRating}
                  </span>
                  <p className="stat-desc">Системи</p>
                </div>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h4>Переглянуто</h4>
              <span className="stat-value">{watchedCount}</span>
              <p className="stat-desc">Завершених аніме</p>
            </div>
            <div className="stat-icon">✅</div>
          </div>

          <div className="stat-card">
            <div className="stat-info">
              <h4>Улюблені</h4>
              <span className="stat-value">{favoritesCount}</span>
              <p className="stat-desc">У серденьку</p>
            </div>
            <div className="stat-icon">❤️</div>
          </div>
        </section>

          {/* Блок популярних аніме на головній (показуємо, якщо є) */}
          <h2 className="gallery-title"> Популярні <span className="title-badge">Рейтинг 8.5+</span></h2>
          <AnimeList list={popularAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>

          <TopAnimeList />
          
          {/* Блок аніме користувача на головній (показуємо, якщо є додані користувачем) */}
          {myAnimeList.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title"> Мої додані аніме <span className="title-badge" style={{backgroundColor: '#10b981', color: '#fff'}}>{myAnimeList.length}</span></h2>
              <AnimeList list={myAnimeList} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
            </div>
          )}

          {/* Блок улюблених на головній (показуємо, якщо є лайки) */}
          {favoriteAnime.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title"> Улюблені <span className="title-badge">{favoriteAnime.length}</span></h2>
              <AnimeList list={favoriteAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
            </div>
          )}

          {/* Блок переглянутих на головній (показуємо, якщо є переглянуті) */}
          {watchedAnime.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title"> Переглянуті <span className="title-badge">{watchedAnime.length}</span></h2>
              <AnimeList list={watchedAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
            </div>
          )}
        </>
      )}

      {/* Для відображення на сторінці популярних аніме */}
      {currentTab === 'popular' && (
        <>
          <h2 className="gallery-title"> Усі популярні аніме <span className="title-badge">{data.length}</span></h2>
          <AnimeList list={popularAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
        </>
      )}

      {/* Для відображення на сторінці улюблених аніме */}
      {currentTab === 'favorite' && (
        <>
          <h2 className="gallery-title"> Ваші улюблені аніме <span className="title-badge">{favoriteAnime.length}</span></h2>
          
          <section className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-info">
                <h4>Улюблених аніме</h4>
                <span className="stat-value">{favStats.count}</span>
                <p className="stat-desc">Тільки обрані</p>
              </div>
              <div className="stat-icon">❤️</div>
            </div>

            <div className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Середня оцінка (Ваша vs Система)</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#8b5cf6' }}>★ {favStats.userAvg}</span>
                    <p className="stat-desc">Ваша</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b' }}>★ {favStats.globalAvg}</span>
                    <p className="stat-desc">Системи</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h4>Всього епізодів</h4>
                <span className="stat-value">{favStats.totalEpisodes}</span>
                <p className="stat-desc">У всіх улюблених</p>
              </div>
              <div className="stat-icon">📺</div>
            </div>

            <div className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  {/* Найстаріше аніме */}
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>
                      {favYears.oldest} 
                    </span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  
                  {/* Розділювач */}
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>

                  {/* Найновіше аніме */}
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>
                      {favYears.newest}
                    </span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">📅</div>
            </div>
          </section>

          {favoriteAnime.length > 0 ? (
            <AnimeList list={favoriteAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
          ) : (
            <p className="empty-message">
              Список порожній. Перейдіть на Головну сторінку та натисніть ♡ на картці, щоб додати аніме.
            </p>
          )}
        </>
      )}

      {/* Для відображення на сторінці переглянутих аніме */}
      {currentTab === 'watched' && (
        <>
          <h2 className="gallery-title"> Переглянуті аніме <span className="title-badge">{watchedAnime.length}</span></h2>
          
          <section className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-info">
                <h4>Переглянуті аніме</h4>
                <span className="stat-value">{watchedStats.count}</span>
                <p className="stat-desc">Тільки переглянуті</p>
              </div>
              <div className="stat-icon">👁️</div>
            </div>

            <div className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Середня оцінка (Ваша vs Система)</h4>
                <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#8b5cf6' }}>★ {watchedStats.userAvg}</span>
                    <p className="stat-desc">Ваша</p>
                  </div>
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>
                  <div>
                    <span className="stat-value" style={{ fontSize: '22px', color: '#64748b' }}>★ {watchedStats.globalAvg}</span>
                    <p className="stat-desc">Системи</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h4>Всього епізодів</h4>
                <span className="stat-value">{watchedStats.totalEpisodes}</span>
                <p className="stat-desc">У всіх переглянутих</p>
              </div>
              <div className="stat-icon">📺</div>
            </div>

            <div className="stat-card">
              <div className="stat-info" style={{ width: '100%' }}>
                <h4>Часові межі списку</h4>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  {/* Найстаріше аніме */}
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#64748b' }}>
                      {watchedYears.oldest} 
                    </span>
                    <p className="stat-desc">Найстаріше</p>
                  </div>
                  
                  {/* Розділювач */}
                  <div style={{ width: '1px', background: '#e2e8f0' }}></div>

                  {/* Найновіше аніме */}
                  <div>
                    <span className="stat-value" style={{ margin: '0', fontSize: '24px', color: '#6366f1' }}>
                      {watchedYears.newest} 
                    </span>
                    <p className="stat-desc">Найновіше</p>
                  </div>
                </div>
              </div>
              <div className="stat-icon">📅</div>
            </div>
          </section>

          {watchedAnime.length > 0 ? (
            <AnimeList list={watchedAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
          ) : (
            <p className="empty-message">
              У вас ще немає переглянутих аніме. Відмітьте аніме галочкою "✅ Переглянуто", коли подивитесь його.
            </p>
          )}
        </>
      )}

      {/* Для відображення на сторінці "Мої аніме" */}
      {currentTab === 'my-anime' && (
        <div className="my-anime-page">
          <div className="my-anime-header">
            <h2>Твій особистий каталог</h2>
            <p>Не знайшли аніме, яке шукали? Створіть власну колекцію! Додайте сюди тайтли, які запали вам у душу, щоб зберегти історію своїх переглядів або відкласти їх на майбутнє. Не пам'ятаєте всі деталі? Не біда — достатньо лише назви. Ваш особистий всесвіт аніме починається тут!</p>
          </div>
          
          <AddAnimeForm onAddAnime={onAddAnime} />

          {/* Виводимо додані аніме прямо під формою */}
          {myAnimeList.length > 0 && (
            <div className="category-section" style={{marginTop: '40px'}}>
              <h2 className="gallery-title"> Додані вами аніме </h2>
              <AnimeList list={myAnimeList} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} onDeleteAnime={onDeleteAnime} onUpdateRating={onUpdateRating}/>
            </div>
          )}
        </div>
      )}

    </main>
  );
};

export default Main;