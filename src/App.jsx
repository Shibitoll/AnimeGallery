import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import './styles/App.css';

/**
 * Головний компонент застосунку AnimeGallery.
 * Управляє глобальним станом списку аніме, навігацією та взаємодією з API.
 * * @component
 */
function App() {
  const [animeList, setAnimeList] = useState([]);
  const [currentTab, setCurrentTab] = useState('home');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://127.0.0.1:8000/api/animes/';

/**
   * Завантажує список аніме з бекенду при першому рендері компонента.
   * Використовує асинхронну функцію всередині useEffect.
   * @function fetchAnime
   * @memberof App
   * @inner
   * @async
   * @returns {void}
   */
  useEffect(() => {
    const fetchAnime = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Помилка мережі');
        const data = await response.json();
        setAnimeList(data);
      } catch (error) {
        console.error("Не вдалося завантажити аніме:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

/**
   * Оновлює статус "Улюблене" для конкретного аніме через PATCH-запит.
   * @function toggleFavorite
   * @memberof App
   * @inner
   * @async
   * @param {number} id - Унікальний ідентифікатор аніме.
   */
  const toggleFavorite = async (id) => {
    const anime = animeList.find(a => a.id === id);
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !anime.isFavorite })
      });
      if (response.ok) {
        const updated = await response.json();
        setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу улюбленого:", error);
    }
  };

/**
   * Оновлює статус "Переглянуто" для конкретного аніме через PATCH-запит.
   * @function toggleWatched
   * @memberof App
   * @inner
   * @async
   * @param {number} id - Унікальний ідентифікатор аніме.
   */
  const toggleWatched = async (id) => {
    const anime = animeList.find(a => a.id === id);
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isWatched: !anime.isWatched })
      });
      if (response.ok) {
        const updated = await response.json();
        setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу перегляду:", error);
    }
  };

/**
   * Додає новий запис аніме до бази даних через POST-запит.
   * @function addAnime
   * @memberof App
   * @inner
   * @async
   * @param {Object} newAnime - Об'єкт з даними нового аніме (title, genres, rating тощо).
   */
const addAnime = async (newAnime) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAnime) // Просто передаємо об'єкт з форми
    });

    if (response.ok) {
      const savedAnime = await response.json();
      setAnimeList(prev => [savedAnime, ...prev]);
    } else {
      const errorData = await response.json();
      console.error("Деталі помилки 400:", errorData);
    }
  } catch (error) {
    console.error("Помилка при додаванні:", error);
  }
};

/**
   * Видаляє аніме з бази даних через DELETE-запит після підтвердження користувачем.
   * @function deleteAnime
   * @memberof App
   * @inner
   * @async
   * @param {number} id - Ідентифікатор аніме для видалення.
   */
const deleteAnime = async (id) => {
  const isConfirmed = window.confirm("Ви впевнені, що хочете видалити це аніме?");
  if (!isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}${id}/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      setAnimeList(prev => prev.filter(a => a.id !== id));
    } else {
      console.error("Сервер відхилив видалення. Статус:", response.status);
    }
  } catch (error) {
    console.error("Помилка мережі при видаленні:", error);
  }
};

/**
   * Оновлює персональну оцінку аніме через PATCH-запит.
   * @function updateRating
   * @memberof App
   * @inner
   * @async
   * @param {number} id - Ідентифікатор аніме.
   * @param {number|string} newRating - Нове значення рейтингу (від 0 до 10).
   */
  const updateRating = async (id, newRating) => {
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userRating: newRating })
      });
      if (response.ok) {
        const updated = await response.json();
        setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (error) {
      console.error("Помилка при оновленні рейтингу:", error);
    }
  };

  if (loading) return <div className="loading">Завантаження...</div>;


  return (
    <div className="app-wrapper">
      <Header 
        favoriteCount={animeList.filter(a => a.isFavorite).length} 
        watchedCount={animeList.filter(a => a.isWatched).length}
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
      />
      <Main 
        data={animeList} 
        toggleFavorite={toggleFavorite} 
        toggleWatched={toggleWatched}
        currentTab={currentTab}
        onAddAnime={addAnime}
        onDeleteAnime={deleteAnime}
        onUpdateRating={updateRating}
      />
      <Footer />
    </div>
  );
}

export default App;
