import React from 'react';
import AnimeCard from './AnimeCard';
import { animeList } from '../data/data';

const Main = () => {
  return (
    <main className="main-content">

      <section className="welcome-section">
        <h1>Ласкаво просимо до AnimeGallery</h1>
        <p>Відкрийте для себе найкращі аніме, оцінюйте та створюйте власну колекцію.</p>
      </section>

      <h2 className="gallery-title"> Популярні <span className="title-badge">Рейтинг 8.5+</span></h2>
      
      <div className="anime-grid">
        {animeList.map((anime) => (
          <AnimeCard 
            key={anime.id} 
            title={anime.title}
            poster={anime.poster}
            rating={anime.rating}
            description={anime.description}
            year={anime.year}
            episodes={anime.episodes}
            studio={anime.studio}
            genres={anime.genres}
            status={anime.status}
          />
        ))}
      </div>
    </main>
  );
};

export default Main;