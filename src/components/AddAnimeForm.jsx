import React, { useState } from 'react';
import '../styles/AddAnimeForm.css'; 

const AddAnimeForm = ({ onAddAnime }) => {
  const [title, setTitle] = useState('');
  const [poster, setPoster] = useState('');
  const [description, setDescription] = useState('');
  const [year, setYear] = useState('');
  const [episodes, setEpisodes] = useState('');
  const [studio, setStudio] = useState('');
  const [genres, setGenres] = useState('');
  const [rating, setRating] = useState('');
  const [status, setStatus] = useState('plan'); 

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Назва — це єдине обов'язкове поле. Будь ласка, введіть її!");
      return;
    }

    const defaultPosterText = "Твоя уява\nмалює краще\nза будь-який\nпостер!";
    const encodedText = encodeURIComponent(defaultPosterText);
    const generatedPoster = `https://placehold.co/300x420/e5e7eb/4b5563?text=${encodedText}&font=Montserrat`;
    
    const safeRating = rating.trim() ? parseFloat(rating.replace(',', '.')).toFixed(1) : '0.0';

    const newAnime = {
      title: title.trim(),
      poster: poster.trim() || generatedPoster,
      description: description.trim() || 'Власне аніме, додане до особистої колекції. Час відкривати нові світи!',
      year: String(year.trim() || '—'),
      episodes: String(episodes.trim() || '—'),
      studio: studio.trim() || 'Таємна студія',
      genres: genres.trim() || 'Жанр невідомий',
      rating: safeRating,
      userRating: safeRating,
      status: status === 'watched' ? 'Завершено' : 'Онгоінг',
      isFavorite: false,
      isWatched: status === 'watched',
      planned: status === 'plan',
      isAddedByUser: true
    };

    onAddAnime(newAnime);

    setTitle(''); setPoster(''); setDescription(''); setYear('');
    setEpisodes(''); setStudio(''); setGenres(''); setRating(''); setStatus('plan');
  };

  return (
    <div className="add-anime-form-container">
      <div className="form-header-badge">Створення запису</div>
      <h3 className="form-main-title">Додати нове аніме</h3>
      <p className="form-subtitle">Заповніть інформацію про тайтл, щоб назавжди зберегти його у своєму особистому каталозі.</p>
      
      <form onSubmit={handleSubmit} className="modern-anime-form">
        
        {/* ВЕРХНЯ ЧАСТИНА: Головне поле */}
        <div className="form-group full-width">
          <label>Назва аніме <span className="required">*</span></label>
          <div className="input-with-icon">
            <span className="input-icon">🎬</span>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Наприклад: Cyberpunk: Edgerunners" 
              className="modern-input"
            />
          </div>
        </div>

        {/* СЕРЕДНЯ ЧАСТИНА: Сітка характеристик */}
        <div className="modern-form-grid">
          
          <div className="form-group">
            <label>Жанри</label>
            <div className="input-with-icon">
              <span className="input-icon">🎭</span>
              <input 
                type="text" 
                value={genres} 
                onChange={(e) => setGenres(e.target.value)} 
                placeholder="Екшн, Фантастика..." 
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Студія</label>
            <div className="input-with-icon">
              <span className="input-icon">🏢</span>
              <input 
                type="text" 
                value={studio} 
                onChange={(e) => setStudio(e.target.value)} 
                placeholder="Studio Trigger" 
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Рік випуску</label>
            <div className="input-with-icon">
              <span className="input-icon">📅</span>
              <input 
                type="number" 
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                placeholder="2022" 
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Кількість епізодів</label>
            <div className="input-with-icon">
              <span className="input-icon">📺</span>
              <input 
                type="text" 
                value={episodes} 
                onChange={(e) => setEpisodes(e.target.value)} 
                placeholder="10 еп." 
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Ваша оцінка (1-10)</label>
            <div className="input-with-icon">
              <span className="input-icon">⭐</span>
              <input 
                type="text" 
                value={rating} 
                onChange={(e) => setRating(e.target.value)} 
                placeholder="9.5" 
                className="modern-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Статус</label>
            <div className="input-with-icon select-wrapper">
              <span className="input-icon">📌</span>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="modern-select">
                <option value="plan">Буду дивитись</option>
                <option value="watched">Вже переглянуто</option>
              </select>
            </div>
          </div>

        </div>

        {/* НИЖНЯ ЧАСТИНА: Посилання та Опис */}
        <div className="form-group full-width">
          <label>URL-посилання на постер (необов'язково)</label>
          <div className="input-with-icon">
            <span className="input-icon">🖼️</span>
            <input 
              type="text" 
              value={poster} 
              onChange={(e) => setPoster(e.target.value)} 
              placeholder="https://..." 
              className="modern-input"
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label>Короткий опис або ваші враження</label>
          <div className="textarea-wrapper">
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Про що це аніме? Залиште тут свої думки..."
              className="modern-textarea"
            ></textarea>
          </div>
        </div>

        {/* КНОПКА САБМІТУ */}
        <div className="form-submit-container">
          <button type="submit" className="modern-submit-btn">
            <span className="btn-icon">+</span> Додати до мого каталогу
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default AddAnimeForm;