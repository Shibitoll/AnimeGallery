import React from 'react';

const About = () => {
  return (
    <div className="about-container">
      {/* HEADER SECTION */}
      <div className="about-hero">
        <h1 className="about-title">
          <span className="logo-icon">⛩️</span> Anime<span className="highlight">Gallery</span>
        </h1>
        <p className="about-subtitle">
          Сучасна клієнт-серверна веб-система для каталогізації, відстеження та перегляду аніме-контенту.
        </p>
      </div>

      {/* FEATURES GRID */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🔍</div>
          <h3>Глобальна база даних</h3>
          <p>
            Інтеграція з найбільшим світовим каталогом MyAnimeList (через Jikan API) забезпечує доступ до тисяч тайтлів з актуальними рейтингами, описами та трейлерами.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Особистий трекер</h3>
          <p>
            Створюйте власний простір: додавайте аніме в улюблені, плануйте перегляди та відмічайте завершені серіали. Уся ваша історія та статистика завжди під рукою.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">▶️</div>
          <h3>Зручний плеєр</h3>
          <p>
            Дивіться офіційні трейлери та переходьте безпосередньо до перегляду серій в одному інтерфейсі, без необхідності відкривати десятки вкладок.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Надійність та швидкість</h3>
          <p>
            Завдяки розумній системі кешування на бекенді, дані завантажуються миттєво. Система спроєктована з акцентом на якість коду та безперебійну роботу.
          </p>
        </div>
      </div>

      {/* TECH STACK SECTION */}
      <div className="tech-section">
        <h2>Під капотом</h2>
        <p className="tech-desc">
          Проєкт побудований з використанням сучасних технологій веброзробки, де особливу увагу приділено архітектурі та контролю якості коду через статичний аналіз.
        </p>
        
        <div className="tech-tags">
          <span className="tech-tag react">⚛️ React 18</span>
          <span className="tech-tag django">🐍 Django REST Framework</span>
          <span className="tech-tag sqlite">🗄️ SQLite</span>
          <span className="tech-tag api">🌐 Jikan API v4</span>
          <span className="tech-tag ui">🎨 CSS Flexbox/Grid</span>
        </div>
      </div>

    </div>
  );
};

export default About;