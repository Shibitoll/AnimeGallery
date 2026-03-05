import React from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';

const Main = ({data, toggleFavorite, toggleWatched, currentTab, onAddAnime, onDeleteAnime, onUpdateRating }) => {
  
  // 1. Фільтруємо аніме, з якими була взаємодія (унікальні для користувача)
  const interactedAnime = data.filter(anime => 
    anime.isFavorite || 
    anime.isWatched || 
    anime.isAddedByUser || 
    (anime.userRating && anime.userRating !== '0.0')
  );

  // 2. Рахуємо кількість взаємодій та улюблених
  const totalInteracted = interactedAnime.length;
  const favoritesCount = data.filter(a => a.isFavorite).length;
  const watchedCount = data.filter(a => a.isWatched).length; // Додаткова метрика

  // ==========================================
  // 2. ЧЕСНЕ ПОРІВНЯННЯ ОЦІНОК
  // Відбираємо ТІЛЬКИ ті аніме, які оцінив користувач
  // ==========================================
  const ratedAnime = data.filter(a => a.userRating && a.userRating !== '0.0');

  // Ваша середня оцінка для цих аніме
  const avgUserRating = ratedAnime.length > 0 
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.userRating), 0) / ratedAnime.length).toFixed(1) 
    : '0.0';

  // Середня оцінка системи для ТИХ ЖЕ САМИХ аніме
  const avgGlobalRating = ratedAnime.length > 0
    ? (ratedAnime.reduce((sum, a) => sum + parseFloat(a.rating), 0) / ratedAnime.length).toFixed(1)
    : '0.0';

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