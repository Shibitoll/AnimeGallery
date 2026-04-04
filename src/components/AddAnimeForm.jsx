import React, { useState } from 'react';
import { Button, Input } from './ui';
import '../styles/AddAnimeForm.css'; 

/**
 * Компонент форми для додавання нового аніме до персонального каталогу.
 * * Дозволяє користувачеві ввести назву, опис, постер та інші характеристики тайтла.
 * Якщо постер не вказано, генерує автоматичне зображення-заглушку.
 * * @component
 * @param {Object} props - Властивості компонента.
 * @param {Function} props.onAddAnime - Функція зворотного виклику, яка приймає об'єкт нового аніме та додає його до загального списку.
 */
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

  /**
   * Обробник події відправки форми.
   * Валідує назву, формує об'єкт нового аніме з дефолтними значеннями та очищає форму.
   * * @function handleSubmit
   * @memberof AddAnimeForm
   * @inner
   * @param {React.FormEvent} e - Подія відправки форми.
   * @returns {void}
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Назва — це єдине обов'язкове поле. Будь ласка, введіть її!");
      return;
    }

    const defaultPosterText = "Твоя уява\nмалює краще\nза будь-який\nпостер!";
    const encodedText = encodeURIComponent(defaultPosterText);
    const generatedPoster = `https://placehold.co/300x420/e5e7eb/4b5563?text=${encodedText}&font=Montserrat`;
    
    /**
     * Об'єкт нового аніме, що готується до відправки.
     * @type {Object}
     */
    const newAnime = {
      title: title.trim(),
      poster: poster.trim() || generatedPoster,
      description: description.trim() || 'Власне аніме, додане до особистої колекції. Час відкривати нові світи!',
      year: year.trim() || '—',
      episodes: episodes.trim() || '—',
      studio: studio.trim() || 'Таємна студія',
      genres: genres.trim() || 'Жанр невідомий',
      rating: rating.trim() || '0.0',
      userRating: rating.trim() || '0.0',
      status: status === 'watched' ? 'Завершено' : 'Онгоінг',
      isFavorite: false,
      isWatched: status === 'watched',
      isAddedByUser: true
    };

    onAddAnime(newAnime);

    // Очищаємо форму
    setTitle(''); setPoster(''); setDescription(''); setYear('');
    setEpisodes(''); setStudio(''); setGenres(''); setRating(''); setStatus('plan');
  };

  return (
    <div className="add-anime-form-container">
      <form onSubmit={handleSubmit} className="add-anime-form">
        
        {/* Використовуємо UI-компонент Input */}
        <Input 
          label="Назва аніме * (обов'язково)" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Наприклад: Cyberpunk: Edgerunners" 
        />

        <div className="form-grid">
          <Input 
            label="Жанри (через кому)" 
            value={genres} 
            onChange={(e) => setGenres(e.target.value)} 
            placeholder="Екшн, Фантастика..." 
          />
          <Input 
            label="Рік випуску" 
            type="number"
            value={year} 
            onChange={(e) => setYear(e.target.value)} 
            placeholder="2022" 
          />
          <Input 
            label="Кількість епізодів" 
            value={episodes} 
            onChange={(e) => setEpisodes(e.target.value)} 
            placeholder="10 еп." 
          />
          <Input 
            label="Студія" 
            value={studio} 
            onChange={(e) => setStudio(e.target.value)} 
            placeholder="Studio Trigger" 
          />
          <Input 
            label="Ваша оцінка (рейтинг)" 
            value={rating} 
            onChange={(e) => setRating(e.target.value)} 
            placeholder="9.5" 
          />

          <div className="form-group">
            <label className="form-label-legacy">Статус перегляду</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-select-custom">
              <option value="plan">Буду дивитись</option>
              <option value="watched">Вже переглянуто</option>
            </select>
          </div>
        </div>

        <Input 
          label="URL-посилання на постер (картинку)" 
          value={poster} 
          onChange={(e) => setPoster(e.target.value)} 
          placeholder="https://..." 
        />

        <div className="form-group">
          <label className="form-label-legacy">Короткий опис або ваші враження</label>
          <textarea 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            placeholder="Про що це аніме?"
            className="form-textarea-custom"
          ></textarea>
        </div>

        <Button type="submit" variant="primary" className="submit-btn-wide">
          + Додати до мого каталогу
        </Button>
      </form>
    </div>
  );
};

export default AddAnimeForm;