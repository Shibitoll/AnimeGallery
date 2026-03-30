import React from 'react';
import { useParams, Link } from 'react-router-dom';

const AnimeDetails = ({ allAnime }) => {
  const { id } = useParams();
  // Пошук аніме за ID (приводимо до числа, якщо ID в масиві — число)
  const anime = allAnime.find(item => item.id.toString() === id);

  if (!anime) {
    return (
      <div className="api-status-container error-block">
        <h2>⚠️ Аніме не знайдено</h2>
        <p>На жаль, тайтл з ID {id} відсутній у нашій базі.</p>
        <Link to="/catalog" className="back-link">Повернутися до каталогу</Link>
      </div>
    );
  }

  return (
    <div className="anime-details-page">
      <Link to="/" className="back-link">← Назад до списку</Link>
      <div className="details-container">
        <img src={anime.poster} alt={anime.title} className="details-poster" />
        <div className="details-info">
          <h1>{anime.title}</h1>
          <p className="details-genre"><b>Жанр:</b> {anime.genres}</p>
          <p className="details-meta"><b>Рік:</b> {anime.year} | <b>Серій:</b> {anime.episodes}</p>
          <p className="details-rating"><b>Оцінка користувача:</b> {anime.userRating}</p>
          <div className="details-desc">
            <h3>Опис</h3>
            <p>{anime.description || "Опис для цього аніме ще не додано."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;