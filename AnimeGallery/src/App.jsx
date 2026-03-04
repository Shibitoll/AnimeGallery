import React, { useState } from 'react';
import { animeList as initialAnimeList } from './data/data';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const [animeList, setAnimeList] = useState(initialAnimeList);

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

  return (
    <>
      <Header 
        favoriteCount={animeList.filter(a => a.isFavorite).length} 
        watchedCount={animeList.filter(a => a.isWatched).length}
      />
      <Main 
        data={animeList} 
        toggleFavorite={toggleFavorite} 
        toggleWatched={toggleWatched}
      />
      <Footer />
    </>
  );
}

export default App;