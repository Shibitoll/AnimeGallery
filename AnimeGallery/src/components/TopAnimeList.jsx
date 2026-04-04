import React, { useState, useEffect } from 'react';
import { Card } from './ui';

const TopAnimeList = () => {
  const [topAnime, setTopAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopAnime = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // ендпоінт сезонних новинок
        const response = await fetch('https://api.jikan.moe/v4/seasons/now');
        
        if (!response.ok) {
          throw new Error(`Помилка сервера: ${response.status}`);
        }
        
        const result = await response.json();
        
        const uniqueAnime = result.data.reduce((acc, current) => {
          const x = acc.find(item => item.mal_id === current.mal_id);
          return !x ? acc.concat([current]) : acc;
        }, []);

        setTopAnime(uniqueAnime.slice(0, 10));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopAnime();
  }, []);

  // 1. Стан завантаження
  if (isLoading) {
    return (
      <div className="api-status-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Отримуємо свіжі новинки сезону...</div>
      </div>
    );
  }

  // 2. Стан помилки
  if (error) {
    return (
      <div className="api-status-container error-block">
        <span className="error-icon">⚠️</span>
        <div className="error-text">Не вдалося завантажити новинки: {error}</div>
      </div>
    );
  }

  // 3. Успішне відображення
  return (
    <section className="api-section">
      <h2 className="gallery-title" style={{ marginTop: 'var(--space-lg)', color: 'var(--text-primary)' }}>
        Новинки цього сезону
      </h2>
      <div className="anime-grid">
        {topAnime.map((anime) => (
          <Card key={`top-${anime.mal_id}`} className="api-card">
            <div className="poster-wrapper">
              <img 
                src={anime.images.jpg.image_url} 
                alt={anime.title} 
                className="card-image" 
              />
              {anime.score && (
                <span className="rating-badge mal-rating">
                  MAL ★ {anime.score}
                </span>
              )}
            </div>
            
            {}
            <div className="card-content">
              <h3 className="card-title" style={{ color: 'var(--text-primary)' }}>
                {anime.title_english || anime.title}
              </h3>
              <p className="card-desc" style={{ color: 'var(--text-secondary)' }}>
                {anime.synopsis 
                  ? `${anime.synopsis.slice(0, 100)}...` 
                  : "Опис новинки з'явиться згодом"}
              </p>
              
              <div className="card-footer-info" style={{ borderTop: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                <span>{anime.year || new Date().getFullYear()}</span>
                <span>{anime.type}</span>
                <span>{anime.episodes || '?'} сер.</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default TopAnimeList;