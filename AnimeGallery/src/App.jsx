import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { animeList as initialAnimeList } from './data/data';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import About from './pages/About';
import AnimeDetails from './pages/AnimeDetails';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

function App() {
  // Лінива ініціалізація (отримуємо дані з localStorage або використовуємо початкові)
  const [animeList, setAnimeList] = useState(() => {
    const savedData = localStorage.getItem('anime-data');
    if (savedData) {
      return JSON.parse(savedData); 
    }
    return initialAnimeList; 
  });

  const [currentTab, setCurrentTab] = useState('home');

  // Збереження даних (при кожній зміні)
  useEffect(() => {
    localStorage.setItem('anime-data', JSON.stringify(animeList));
  }, [animeList]); 

  // Функція для лайків
  const toggleFavorite = (id) => {
    setAnimeList((prevList) => 
      prevList.map((anime) => 
        anime.id === id ? { ...anime, isFavorite: !anime.isFavorite } : anime
      )
    );
  };

  // Функція для "Переглянуто"
  const toggleWatched = (id) => {
    setAnimeList((prevList) => 
      prevList.map((anime) => 
        anime.id === id ? { ...anime, isWatched: !anime.isWatched } : anime
      )
    );
  };

  // Функція для "Додавання аніме"
  const addAnime = (newAnime) => {
    setAnimeList((prevList) => [newAnime, ...prevList]);
  };

  // Функція для видалення власного аніме
  const deleteAnime = (id) => {
    const isConfirmed = window.confirm("Ви впевнені, що хочете видалити це аніме зі своєї колекції? Цю дію неможливо буде скасувати.");

    if (isConfirmed) {
      setAnimeList((prevList) => prevList.filter((anime) => anime.id !== id));
    };
  };

  // Функція для оновлення власної оцінки користувача 
  const updateRating = (id, newRating) => {
    setAnimeList((prevList) => 
      prevList.map((anime) => 
        anime.id === id ? { ...anime, userRating: newRating } : anime
      )
    );
  };

  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Header 
          favoriteCount={animeList.filter(a => a.isFavorite).length} 
          watchedCount={animeList.filter(a => a.isWatched).length}
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
        />
          <Routes>
            <Route path="/" element={
              <Main 
                data={animeList} 
                toggleFavorite={toggleFavorite} 
                toggleWatched={toggleWatched}
                currentTab={currentTab}
                onAddAnime={addAnime}
                onDeleteAnime={deleteAnime}
                onUpdateRating={updateRating}
              />
            } />

            <Route path="/popular" element={
              <Main data={animeList} currentTab="popular" onToggleFavorite={toggleFavorite} />
            } />

            <Route path="/favorite" element={
              <Main data={animeList} currentTab="favorite" onToggleFavorite={toggleFavorite} />
            } />

            <Route path="/watched" element={
              <Main data={animeList} currentTab="watched" onToggleFavorite={toggleFavorite} />
            } />

            <Route path="/my-anime" element={
              <Main data={animeList} currentTab="my-anime" onToggleFavorite={toggleFavorite} />
            } />

            <Route path="/about" element={<About />} />

            <Route path="/anime/:id" element={<AnimeDetails allAnime={animeList} />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;