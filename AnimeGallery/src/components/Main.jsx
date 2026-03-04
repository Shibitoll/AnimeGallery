import React from 'react';
import AnimeList from './AnimeList';

const Main = ({data}) => {
  return (
    <main className="main-content">

      <section className="welcome-section">
        <h1>Ласкаво просимо до AnimeGallery</h1>
        <p>Відкрийте для себе найкращі аніме, оцінюйте та створюйте власну колекцію.</p>
      </section>

      <h2 className="gallery-title"> Популярні <span className="title-badge">Рейтинг 8.5+</span></h2>
      
      <div className="anime-grid">
        <AnimeList list={data} />
      </div>
    </main>
  );
};

export default Main;