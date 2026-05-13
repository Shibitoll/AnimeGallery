import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamingApi } from '../api/streamingApi';
import ScreenshotsGallery from '../components/ScreenshotsGallery';
import '../styles/AnimeDetails.css';

const AnimeDetails = ({ data = [], onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const result = await streamingApi.getAnimeInfo(id);
        setAnime(result);
      } catch (error) {
        console.error("Помилка завантаження деталей", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const localAnime = data.find(a => String(a.anihubId) === String(id));

  // Синхронізація станів з локальною базою
  const isFav = localAnime?.is_favorite || false;
  const isWatching = localAnime?.is_watching || false;
  const isWatch = localAnime?.in_watchlist || false;
  const isPlanned = localAnime?.planned || false;

  const handleAction = (actionType, value = '0.0') => {
    // Формуємо повний об'єкт, щоб App міг створити запис, якщо його немає
    const animeToProcess = localAnime || {
      anihubId: id,
      titleUkrainian: anime.title_ukrainian || anime.title_english || anime.title_original,
      poster: anime.poster_url,
      rating: anime.rating,
      year: anime.year,
      episodesCount: anime.episodes_count,
      genres: anime.genres,
      description: anime.description_uk || anime.description,
      type: anime.type,
      status: anime.status
    };

    if (actionType === 'favorite') onToggleFavorite(animeToProcess);
    if (actionType === 'watching') onToggleWatching(animeToProcess);
    if (actionType === 'watched') onToggleWatched(animeToProcess);
    if (actionType === 'planned') onTogglePlanned(animeToProcess);
    if (actionType === 'rating') onUpdateRating(animeToProcess, value);
  };

  if (loading) return <div className="loading-screen">Завантаження...</div>;
  if (!anime) return <div className="error-screen">Аніме не знайдено</div>;

  const displayTitle = anime.title_ukrainian || anime.title_english || anime.title_original;

  return (
    <div className="anime-details-container">
      <button className="back-button" onClick={() => navigate(-1)}> &larr; Назад </button>

      <div className="anime-main-block">
        <div className="anime-sidebar">
          <div className="poster-wrapper">
            <span className={`status-badge ${anime.status === 'ongoing' ? 'ongoing' : ''}`}>
              {anime.status === 'ongoing' ? 'В ефірі' : 'Завершено'}
            </span>
            <img src={anime.poster_url} alt={displayTitle} className="anime-poster" />
          </div>
          
          <div className="tracker-panel">
            <button className={`track-btn ${isWatching ? 'active-watch' : ''}`} onClick={() => handleAction('watching')}>
              {isWatching ? '▶️ Дивлюся' : '👁️ Буду дивитися'}
            </button>
            <button className={`track-btn ${isWatch ? 'active-watched' : ''}`} onClick={() => handleAction('watched')}>
              {isWatch ? '✅ Переглянуто' : '🏁 Завершив'}
            </button>
            <button className={`track-btn ${isPlanned ? 'active-plan' : ''}`} onClick={() => handleAction('planned')}>
              {isPlanned ? '📅 В планах' : '⏳ В плани'}
            </button>
            <button className={`track-btn ${isFav ? 'active-fav' : ''}`} onClick={() => handleAction('favorite')}>
              {isFav ? '❤️ В улюблених' : '🤍 В улюблені'}
            </button>
          </div>
        </div>

        <div className="anime-info">
          <h1 className="anime-title">{displayTitle}</h1>
          <div className="anime-subtitle">{anime.year} | {anime.type?.toUpperCase()}</div>
          <p className="anime-description">{anime.description_uk || anime.description || 'Опис відсутній.'}</p>

          <div className="details-grid">
            <div className="detail-item"><strong>Епізоди:</strong> {anime.episodes_count || '?'}</div>
            <div className="detail-item"><strong>Дубляж:</strong> {anime.has_ukrainian_dub ? 'Так' : 'Ні'}</div>
            <div className="detail-item">
                <strong>Озвучення:</strong> {
                    anime.dubbing_studios?.length > 0 
                    ? anime.dubbing_studios.map(s => s.name).join(', ') 
                    : 'Дані відсутні'
                }
            </div>
            <div className="detail-item"><strong>Рейтинг:</strong> ⭐ {parseFloat(anime.rating || 0).toFixed(1)} / 10</div>
          </div>

          <div className="genres-list">
            {anime.genres?.map(genre => <span key={genre} className="genre-tag">{genre}</span>)}
          </div>
        </div>
      </div>

      <div className="video-section">
        <h3 className="section-title">Кадри з аніме</h3>
        <ScreenshotsGallery animeId={id} />
      </div>
    </div>
  );
};

export default AnimeDetails;