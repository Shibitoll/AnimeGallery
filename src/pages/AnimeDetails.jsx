import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamingApi } from '../api/streamingApi';
import VideoPlayer from '../components/VideoPlayer';
import ReactPlayer from 'react-player';
import '../styles/AnimeDetails.css';

const AnimeDetails = ({ data = [], onAddAnime, onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null);
  const [showTrailer, setShowTrailer] = useState(true);

  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([
    { id: 1, author: "Максим", date: "27.04.2026", rating: 5, text: "Це просто шедевр! Чекаю на наступні серії." },
    { id: 2, author: "Олена", date: "26.04.2026", rating: 4, text: "Дуже гарна мальовка, але сюжет трохи затягнутий." }
  ]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const result = await streamingApi.getAnimeInfo(id);
        setAnime(result);
        
        if (result.episodes && result.episodes.length > 0) {
          setCurrentEpisodeId(result.episodes[0].id);
        }
        
        if (!result.trailer_url) {
          setShowTrailer(false);
        }
      } catch (error) {
        console.error("Помилка завантаження деталей", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const localAnime = data.find(a => String(a.id) === String(id) || String(a.mal_id) === String(id) || a.title === anime?.title);
  const isFav = localAnime ? localAnime.is_favorite : false;
  const isWatching = localAnime ? localAnime.is_watching : false; // ДОДАНО
  const isWatch = localAnime ? localAnime.in_watchlist : false;
  const isPlanned = localAnime ? localAnime.planned : false;

  const handleAction = (actionType, value = '0.0') => {
    if (localAnime) {
      if (actionType === 'favorite' && onToggleFavorite) onToggleFavorite(localAnime);
      if (actionType === 'watching' && onToggleWatching) onToggleWatching(localAnime); // ДОДАНО
      if (actionType === 'watched' && onToggleWatched) onToggleWatched(localAnime);
      if (actionType === 'planned' && onTogglePlanned) onTogglePlanned(localAnime);
      if (actionType === 'rating' && onUpdateRating) onUpdateRating(localAnime, value);
    } else {
      if (onAddAnime && anime) {
        const newAnime = {
          id: id,
          mal_id: id,
          title: anime.title,
          poster: anime.image,
          rating: anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0',
          description: anime.description,
          year: anime.releaseDate || new Date().getFullYear(),
          episodes: anime.episodes?.length || 0,
          studio: 'Невідома',
          genres: anime.genres?.length > 0 ? anime.genres.join(', ') : 'Різне',
          is_favorite: actionType === 'favorite',
          is_watching: actionType === 'watching', // ДОДАНО
          in_watchlist: actionType === 'watched',
          planned: actionType === 'planned',
          user_rating: actionType === 'rating' ? value : '0.0',
          is_added_by_user: false
        };
        onAddAnime(newAnime);
      }
    }
  };

  const handleEpisodeClick = (epId) => {
    setCurrentEpisodeId(epId);
    setShowTrailer(false);
    
    // Автоматично ставимо статус "Дивлюся", якщо користувач почав перегляд і статус ще не "Переглянуто"
    if (!isWatch && !isWatching) {
        handleAction('watching');
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText) return;
    const newComment = {
      id: Date.now(),
      author: "Користувач", 
      date: new Date().toLocaleDateString(),
      rating: rating || 5,
      text: commentText
    };
    setComments([newComment, ...comments]);
    setCommentText("");
    setRating(0);
  };

  if (loading) return <div className="loading-screen">Завантаження інформації...</div>;
  if (!anime) return <div className="error-screen">Аніме не знайдено</div>;

  return (
    <div className="anime-details-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        &larr; Назад до каталогу
      </button>

      <div className="anime-main-block">
        <div className="anime-sidebar">
          <div className="poster-wrapper">
            <span className="status-badge">{anime.status || 'Завершено'}</span>
            <img src={anime.image} alt={anime.title} className="anime-poster" />
          </div>
          
          <div className="tracker-panel">
            <h4 className="tracker-title">Мій список</h4>
            
            {/* --- РОЗУМНИЙ БЛОК СТАТУСІВ ПЕРЕГЛЯДУ --- */}
            {!isWatching && !isWatch && (
              <button 
                className="track-btn" 
                onClick={() => handleAction('watching')}
                style={{ marginBottom: '10px' }}
              >
                👁️ Почати перегляд
              </button>
            )}

            {isWatching && !isWatch && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <div 
                className="full-width-btn"
                style={{ 
                  flex: 1, 
                  backgroundColor: '#3b82f6', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'default' // Робить курсор стандартним
                }}
              >
                ▶️ Дивлюся
              </div>
                <button 
                  className="track-btn" 
                  onClick={() => handleAction('watched')}
                  style={{ flex: 1, margin: 0, padding: '8px 4px' }}
                  title="Завершити перегляд?"
                >
                  🏁 Завершив?
                </button>
              </div>
            )}

            {isWatch && (
              <button 
                className="track-btn active-watch" 
                onClick={() => handleAction('watched')}
                style={{ marginBottom: '10px', backgroundColor: '#10b981', borderColor: '#10b981', color: '#fff' }}
              >
                ✅ Переглянуто
              </button>
            )}

            <button 
              className={`track-btn ${isPlanned ? 'active-plan' : ''}`} 
              onClick={() => handleAction('planned')}
              style={{ marginBottom: '10px' }}
            >
              {isPlanned ? '📅 В планах' : '⏳ Додати в плани'}
            </button>

            <button 
              className={`track-btn ${isFav ? 'active-fav' : ''}`} 
              onClick={() => handleAction('favorite')}
            >
              {isFav ? '❤️ В улюблених' : '🤍 Додати в улюблені'}
            </button>
          </div>
        </div>

        <div className="anime-info">
          <h1 className="anime-title">{anime.title}</h1>
          <div className="anime-subtitle">
            {anime.releaseDate || '2024'} | TV Серіал
          </div>
          
          <p className="anime-description">{anime.description}</p>

          <div className="details-grid">
            <div className="detail-item"><strong>Тип:</strong> {anime.type}</div>
            <div className="detail-item"><strong>Рік:</strong> {anime.releaseDate || 'N/A'}</div>
            <div className="detail-item"><strong>Епізоди:</strong> {anime.episodes?.length || '?'}</div>
            <div className="detail-item"><strong>Статус:</strong> {anime.status}</div>
            <div className="detail-item"><strong>Тривалість:</strong> {anime.duration}</div>
            <div className="detail-item"><strong>Віковий рейтинг:</strong> {anime.age_rating}</div>
            <div className="detail-item"><strong>Студія:</strong> {Array.isArray(anime.studio) ? anime.studio.join(', ') : anime.studio}</div>
            <div className="detail-item"><strong>Джерело:</strong> {anime.source}</div>
            <div className="detail-item"><strong>Рейтинг MAL:</strong> ⭐ {anime.rating || 'N/A'} / 10</div>
          </div>

          <div className="genres-list">
            {anime.genres && anime.genres.map(genre => (
              <span key={genre} className="genre-tag">{genre}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="video-section">
        <div className="player-tabs">
          {anime.trailer_url && (
            <button 
              className={`tab-btn ${showTrailer ? 'active' : ''}`}
              onClick={() => setShowTrailer(true)}
            >
              🎬 Дивитися Трейлер
            </button>
          )}
          <button 
            className={`tab-btn ${!showTrailer ? 'active' : ''}`}
            onClick={() => setShowTrailer(false)}
          >
            ▶ Перегляд Серій
          </button>
        </div>
        
        <div className="player-container">
          {showTrailer ? (
            <div className="player-wrapper" style={{ position: 'relative', paddingTop: '56.25%' }}>
              {anime.trailer_url ? (
                <ReactPlayer 
                  url={anime.trailer_url} 
                  width="100%" height="100%" 
                  style={{ position: 'absolute', top: 0, left: 0 }}
                  controls playing={false}
                />
              ) : (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000', color: '#fff' }}>
                  Трейлер відсутній у базі MAL
                </div>
              )}
            </div>
          ) : (
            currentEpisodeId ? (
              <VideoPlayer episodeId={currentEpisodeId} poster={anime.image} />
            ) : (
              <div className="no-video">Оберіть епізод для перегляду</div>
            )
          )}
        </div>
        
        <div className="episodes-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>Список серій:</h3>
          </div>
          <div className="episodes-grid">
            {anime.episodes && anime.episodes.map(ep => (
              <button 
                key={ep.id} 
                className={`episode-btn ${(!showTrailer && currentEpisodeId === ep.id) ? 'active' : ''}`}
                onClick={() => handleEpisodeClick(ep.id)}
              >
                Серія {ep.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="community-section">
        <h2>Відгуки та коментарі ({comments.length})</h2>
        
        <form className="comment-form" onSubmit={handleAddComment}>
          <div className="rating-select">
            Оцініть аніме: 
            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="5" /> 
            / 5 зірок
          </div>
          <textarea 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Поділіться своїми враженнями... Що сподобалось? Що розчарувало?"
            required
          />
          <button type="submit" className="submit-comment-btn">Опублікувати коментар</button>
        </form>

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-header">
                <strong>{comment.author}</strong>
                <span className="comment-date">{comment.date}</span>
                <span className="comment-rating">⭐ {comment.rating}/5</span>
              </div>
              <p className="comment-text">{comment.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;