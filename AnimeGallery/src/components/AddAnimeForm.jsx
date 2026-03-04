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

    const newAnime = {
      id: Date.now(),
      title: title.trim(),
      poster: poster.trim() || generatedPoster,
      description: description.trim() || 'Власне аніме, додане до особистої колекції. Час відкривати нові світи!',
      year: year.trim() || '—',
      episodes: episodes.trim() || '—',
      studio: studio.trim() || 'Таємна студія',
      genres: genres.trim() || 'Жанр невідомий',
      rating: rating.trim() || '0.0',
      status: status === 'watched' ? 'Завершено' : 'Онгоінг',
      isFavorite: false,
      isWatched: status === 'watched',
      isAddedByUser: true // Спеціальний прапорець, щоб відрізнити аніме користувача від бази
    };

    onAddAnime(newAnime);

    // Очищаємо форму
    setTitle(''); setPoster(''); setDescription(''); setYear('');
    setEpisodes(''); setStudio(''); setGenres(''); setRating(''); setStatus('plan');
  };

  return (
    <div className="add-anime-form-container">
      <form onSubmit={handleSubmit} className="add-anime-form">
        
        <div className="form-group">
          <label>Назва аніме * (обов'язково)</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Наприклад: Cyberpunk: Edgerunners" />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Жанри (через кому)</label>
            <input type="text" value={genres} onChange={(e) => setGenres(e.target.value)} placeholder="Екшн, Фантастика..." />
          </div>
          <div className="form-group">
            <label>Рік випуску</label>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Наприклад: 2022" />
          </div>
          <div className="form-group">
            <label>Кількість епізодів</label>
            <input type="text" value={episodes} onChange={(e) => setEpisodes(e.target.value)} placeholder="10 еп." />
          </div>
          <div className="form-group">
            <label>Студія</label>
            <input type="text" value={studio} onChange={(e) => setStudio(e.target.value)} placeholder="Studio Trigger" />
          </div>
          <div className="form-group">
            <label>Ваша оцінка (рейтинг)</label>
            <input type="text" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="Наприклад: 9.5" />
          </div>
          <div className="form-group">
            <label>Статус перегляду</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="plan">Буду дивитись</option>
              <option value="watched">Вже переглянуто</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>URL-посилання на постер (картинку)</label>
          <input type="text" value={poster} onChange={(e) => setPoster(e.target.value)} placeholder="https://..." />
        </div>

        <div className="form-group">
          <label>Короткий опис або ваші враження</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Про що це аніме?"></textarea>
        </div>

        <button type="submit" className="submit-btn">+ Додати до мого каталогу</button>
      </form>
    </div>
  );
};

export default AddAnimeForm;