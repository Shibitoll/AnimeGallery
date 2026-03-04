import React from 'react';
import AnimeList from './AnimeList';

const Main = ({data, toggleFavorite, toggleWatched, currentTab }) => {
  
  const favoriteAnime = data.filter(anime => anime.isFavorite);
  const watchedAnime = data.filter(anime => anime.isWatched);

  return (
    <main className="main-content">

    {/* Для відображення на головній сторінці */}
      {currentTab === 'home' && (
        <>
          <section className="welcome-section">
            <h1>Ласкаво просимо до AnimeGallery</h1>
            <p>Відкрийте для себе найкращі аніме, оцінюйте та створюйте власну колекцію.</p>
          </section>

          <h2 className="gallery-title"> Популярні <span className="title-badge">Рейтинг 8.5+</span></h2>
          <AnimeList list={data} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />

          {/* Блок улюблених на головній (показуємо, якщо є лайки) */}
          {favoriteAnime.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title"> Улюблені <span className="title-badge">{favoriteAnime.length}</span></h2>
              <AnimeList list={favoriteAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />
            </div>
          )}

          {/* Блок переглянутих на головній (показуємо, якщо є переглянуті) */}
          {watchedAnime.length > 0 && (
            <div className="category-section">
              <h2 className="gallery-title"> Переглянуті <span className="title-badge">{watchedAnime.length}</span></h2>
              <AnimeList list={watchedAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />
            </div>
          )}
        </>
      )}

      {/* Для відображення на сторінці популярних аніме */}
      {currentTab === 'popular' && (
        <>
          <h2 className="gallery-title"> Усі популярні аніме <span className="title-badge">{data.length}</span></h2>
          <AnimeList list={data} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />
        </>
      )}

      {/* Для відображення на сторінці улюблених аніме */}
      {currentTab === 'favorite' && (
        <>
          <h2 className="gallery-title"> Ваші улюблені аніме <span className="title-badge">{favoriteAnime.length}</span></h2>
          
          {favoriteAnime.length > 0 ? (
            <AnimeList list={favoriteAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />
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
            <AnimeList list={watchedAnime} onToggleFavorite={toggleFavorite} onToggleWatched={toggleWatched} />
          ) : (
            <p className="empty-message">
              У вас ще немає переглянутих аніме. Відмітьте аніме галочкою "✅ Переглянуто", коли подивитесь його.
            </p>
          )}
        </>
      )}

    </main>
  );
};

export default Main;