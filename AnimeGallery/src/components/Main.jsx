import React from 'react';
import AnimeList from './AnimeList';
import AddAnimeForm from './AddAnimeForm';

const Main = ({data, toggleFavorite, toggleWatched, currentTab, onAddAnime, onDeleteAnime, onUpdateRating }) => {
  
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