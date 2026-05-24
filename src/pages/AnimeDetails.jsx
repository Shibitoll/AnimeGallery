import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamingApi } from '../api/streamingApi';
import { getAccessToken } from '../api/authApi';
import '../styles/AnimeDetails.css';

const AnimeDetails = ({ data = [], onToggleFavorite, onToggleWatching, onToggleWatched, onTogglePlanned, onUpdateRating }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Стани для коментарів
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Стани для редагування коментарів
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState("");

  const localAnime = data.find(a => String(a.anihubId) === String(id) || String(a.id) === String(id));

  useEffect(() => {
    const fetchDetailsAndComments = async () => {
      if (!id || id === 'undefined') {
          setLoading(false);
          return;
      }
      try {
        setLoading(true);
        const result = await streamingApi.getAnimeInfo(id);
        setAnime(result);

        const commentsData = await streamingApi.getComments(id);
        setComments(commentsData);
      } catch (error) {
        console.error("Помилка завантаження деталей", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetailsAndComments();
  }, [id]);

  const isFav = localAnime?.is_favorite || false;
  const isWatching = localAnime?.is_watching || false;
  const isWatch = localAnime?.in_watchlist || false;
  const isPlanned = localAnime?.planned || false;
  const userRating = localAnime?.user_rating || 0;

  // СУВОРА ЛОГІКА ОЦІНКИ: якщо загальний чи користувацький рейтинг дорівнює 0, скидаємо в "Н/Д"
  const hasValidSiteRating = localAnime?.site_rating && parseFloat(localAnime.site_rating) > 0;
  const siteRating = (hasValidSiteRating && parseInt(userRating) !== 0)
    ? `${parseFloat(localAnime.site_rating).toFixed(1)} / 10` 
    : "Н/Д";

  const handleAction = (actionType, value = '0.0') => {
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const displayTitle = anime.title_ukrainian || anime.title_english || anime.title_original;
      const addedComment = await streamingApi.postComment(id, newComment, displayTitle);
      const formattedComment = { ...addedComment, username: addedComment.user, is_owner: true };
      setComments([formattedComment, ...comments]); 
      setNewComment("");
    } catch (error) {
      alert("Не вдалося відправити коментар.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей коментар?")) return;
    try {
      await streamingApi.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      alert("Не вдалося видалити коментар.");
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editCommentText.trim()) return;
    try {
      const updated = await streamingApi.editComment(commentId, editCommentText);
      setComments(comments.map(c => c.id === commentId ? { ...c, text: updated.text } : c));
      setEditingCommentId(null);
      setEditCommentText("");
    } catch (error) {
      alert("Не вдалося зберегти зміни.");
    }
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

          <div className="rating-panel" style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', textAlign: 'center' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#ccc' }}>Ваша оцінка:</h4>
            <select 
                value={userRating} 
                onChange={(e) => handleAction('rating', e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', background: '#222', color: 'white', border: '1px solid #444' }}
            >
                <option value="0">Не оцінено</option>
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>{num} ⭐</option>
                ))}
            </select>
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
            
            <div className="detail-item" style={{ gridColumn: '1 / -1', background: 'rgba(255,215,0,0.1)', padding: '10px', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <div><strong>Рейтинг AniHub:</strong> ⭐ {anime.rating ? parseFloat(anime.rating).toFixed(1) : '0.0'} / 10</div>
                    <div><strong>Топ AnimeGallery:</strong> 🏆 {siteRating}</div>
                </div>
            </div>
          </div>

          <div className="genres-list">
            {anime.genres?.map(genre => <span key={genre} className="genre-tag">{genre}</span>)}
          </div>
        </div>
      </div>

      <div className="comments-section" style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333' }}>
        <h3 className="section-title">Обговорення ({comments.length})</h3>
        
        {getAccessToken() ? (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                <textarea 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Напишіть свою думку про це аніме..."
                    rows="3"
                    style={{ width: '100%', padding: '15px', borderRadius: '8px', background: '#222', color: 'white', border: '1px solid #444', resize: 'vertical' }}
                    required
                />
                <button type="submit" disabled={isSubmitting} style={{ alignSelf: 'flex-end', padding: '10px 20px', background: '#E50914', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {isSubmitting ? 'Відправка...' : 'Залишити коментар'}
                </button>
            </form>
        ) : (
            <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px', marginBottom: '30px', textAlign: 'center' }}>
                Щоб залишити коментар, необхідно увійти в систему.
            </div>
        )}

        <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {comments.map((comment) => (
                <div key={comment.id} className="comment-card" style={{ padding: '15px', background: '#1a1a1a', borderRadius: '8px', borderLeft: '4px solid #E50914' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9em', color: '#aaa' }}>
                        <strong style={{ color: 'white' }}>@{comment.user || comment.username}</strong>
                        <span>{new Date(comment.date || comment.created_at).toLocaleString('uk-UA')}</span>
                    </div>
                    
                    {editingCommentId === comment.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <textarea 
                                value={editCommentText}
                                onChange={(e) => setEditCommentText(e.target.value)}
                                rows="3"
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#333', color: 'white', border: '1px solid #555' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button onClick={() => { setEditingCommentId(null); setEditCommentText(""); }} style={{ padding: '5px 15px', background: '#555', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Скасувати</button>
                                <button onClick={() => handleSaveEdit(comment.id)} style={{ padding: '5px 15px', background: '#E50914', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Зберегти</button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <p style={{ margin: 0, lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{comment.text}</p>
                            {comment.is_owner && (
                                <div style={{ display: 'flex', gap: '15px', marginTop: '10px', fontSize: '0.85em' }}>
                                    <span onClick={() => setEditingCommentId(comment.id)} style={{ color: '#aaa', cursor: 'pointer', textDecoration: 'underline' }}>Редагувати</span>
                                    <span onClick={() => handleDeleteComment(comment.id)} style={{ color: '#E50914', cursor: 'pointer', textDecoration: 'underline' }}>Видалити</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            ))}
            {comments.length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Поки що немає коментарів. Будьте першим!</p>}
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;