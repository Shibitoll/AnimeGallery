import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import About from './pages/About';
import AnimeDetails from './pages/AnimeDetails';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import Search from './pages/Search';
import './styles/App.css';

/**
 * Головний компонент застосунку AnimeGallery.
 * Управляє глобальним станом списку аніме, навігацією та взаємодією з API.
 * @component
 */
function App() {
  const [animeList, setAnimeList] = useState([]);
  const [currentTab, setCurrentTab] = useState('home');
  const [loading, setLoading] = useState(true);

  const API_URL = 'http://127.0.0.1:8000/api/animes/';

  /**
   * Завантажує список аніме з бекенду при першому рендері.
   */
  /**
   * Завантажує список аніме з бекенду при першому рендері.
   * Проходить по всіх сторінках пагінації Django, щоб не загубити жодного тайтлу!
   */
  useEffect(() => {
    const fetchAnime = async () => {
      try {
        let allAnime = [];
        let nextPageUrl = API_URL;

        // Цикл працюватиме, поки Django повертає посилання "next"
        while (nextPageUrl) {
          const response = await fetch(nextPageUrl);
          if (!response.ok) throw new Error('Помилка мережі');
          
          const data = await response.json();
          
          if (data.results) {
            allAnime = [...allAnime, ...data.results];
            nextPageUrl = data.next; // Беремо посилання на наступну сторінку
          } else {
            // Якщо пагінації раптом немає
            allAnime = data;
            nextPageUrl = null;
          }
        }
        
        setAnimeList(allAnime);
      } catch (error) {
        console.error("Не вдалося завантажити аніме:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnime();
  }, []);

  /**
   * Оновлює статус "Улюблене" через PATCH-запит.
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
   * Оновлює статус "Переглянуто" через PATCH-запит.
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
   * Оновлює статус "В планах" через PATCH-запит.
   */
  const togglePlanned = async (id) => {
    const anime = animeList.find(a => a.id === id);
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planned: !anime.planned }) // Відправляємо нове значення
      });
      if (response.ok) {
        const updated = await response.json();
        setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (error) {
      console.error("Помилка при оновленні статусу планів:", error);
    }
  };

/**
   * Додає нове аніме через POST-запит.
   */
  const addAnime = async (newAnime) => {
    const animeDataToSend = {
      ...newAnime,
      isAddedByUser: newAnime.isAddedByUser !== undefined ? newAnime.isAddedByUser : true
    };
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(animeDataToSend)
      });
      
      if (response.ok) {
        const savedAnime = await response.json();
        setAnimeList(prev => [savedAnime, ...prev]);
      } else {
        // ДОДАНО: Якщо статус 400, читаємо детальну відповідь від Django
        const errorData = await response.json();
        console.error("❌ ДЖАНГО КАЖЕ, ЩО ПОМИЛКА ТУТ:", errorData);
        alert("Помилка від бекенду! Відкрийте консоль (F12), щоб побачити деталі.");
      }
    } catch (error) {
      console.error("Помилка при додаванні:", error);
    }
  };

  /**
   * Видаляє аніме через DELETE-запит.
   */
  const deleteAnime = async (id) => {
    const isConfirmed = window.confirm("Ви впевнені, що хочете видалити це аніме?");
    if (!isConfirmed) return;
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setAnimeList(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error("Помилка мережі при видаленні:", error);
    }
  };

  /**
   * Оновлює рейтинг через PATCH-запит.
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
    <ThemeProvider>
      <div className="app-wrapper">
        <Header 
          favoriteCount={animeList.filter(a => a.isFavorite).length} 
          watchedCount={animeList.filter(a => a.isWatched).length}
          plannedCount={animeList.filter(a => a.planned).length} // Додано підрахунок запланованих
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
        />
        
        <Routes>
          <Route path="/" element={
            <Main 
              data={animeList} 
              currentTab="home"
              toggleFavorite={toggleFavorite} 
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/popular" element={
            <Main 
              data={animeList} 
              currentTab="popular" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime} /* ДОДАНО */
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/new" element={
            <Main 
              data={animeList} 
              currentTab="new" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime} /* ДОДАНО */
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/favorite" element={
            <Main 
              data={animeList} 
              currentTab="favorite" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/watched" element={
            <Main 
              data={animeList} 
              currentTab="watched" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/planned" element={
            <Main 
              data={animeList} 
              currentTab="planned" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/my-anime" element={
            <Main 
              data={animeList} 
              currentTab="my-anime" 
              toggleFavorite={toggleFavorite}
              toggleWatched={toggleWatched}
              togglePlanned={togglePlanned}
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/about" element={<About />} />
          
          <Route path="/anime/:id" element={
            <AnimeDetails 
              data={animeList} 
              onAddAnime={addAnime}
              onToggleFavorite={toggleFavorite}
              onToggleWatched={toggleWatched}
              onTogglePlanned={togglePlanned}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="/search" element={
            <Search 
              data={animeList} 
              onAddAnime={addAnime}
              onToggleFavorite={toggleFavorite}
              onToggleWatched={toggleWatched}
              onTogglePlanned={togglePlanned}
              onUpdateRating={updateRating}
            />
          } />

          <Route path="*" element={<NotFound />} />
        </Routes>
        
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;