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
  const [animeList, setAnimeList] = useState(() => {
    const savedData = localStorage.getItem('anime-data');
    return savedData ? JSON.parse(savedData) : initialAnimeList;
  });

  useEffect(() => {
    localStorage.setItem('anime-data', JSON.stringify(animeList));
  }, [animeList]);

  const toggleFavorite = (id) => {
    setAnimeList(prev => prev.map(a => a.id === id ? { ...a, isFavorite: !a.isFavorite } : a));
  };

  const toggleWatched = (id) => {
    setAnimeList(prev => prev.map(a => a.id === id ? { ...a, isWatched: !a.isWatched } : a));
  };

  const addAnime = (newAnime) => setAnimeList(prev => [newAnime, ...prev]);

  const deleteAnime = (id) => {
    if (window.confirm("Видалити це аніме?")) {
      setAnimeList(prev => prev.filter(a => a.id !== id));
    }
  };

  const updateRating = (id, newRating) => {
    setAnimeList(prev => prev.map(a => a.id === id ? { ...a, userRating: newRating } : a));
  };

  return (
    <ThemeProvider>
      <div className="app-wrapper">
        <Header 
          favoriteCount={animeList.filter(a => a.isFavorite).length} 
          watchedCount={animeList.filter(a => a.isWatched).length}
        />
        
        <Routes>
          <Route path="/" element={
            <Main 
              data={animeList} 
              currentTab="home"
              toggleFavorite={toggleFavorite} 
              toggleWatched={toggleWatched}
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
              onAddAnime={addAnime}
              onDeleteAnime={deleteAnime}
              onUpdateRating={updateRating}
            />
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