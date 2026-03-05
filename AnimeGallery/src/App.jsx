import React, { useState } from 'react';
import { animeList as initialAnimeList } from './data/data';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import './styles/App.css';

function App() {
  const [animeList, setAnimeList] = useState(initialAnimeList);
  const [currentTab, setCurrentTab] = useState('home');

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
      />
      <Footer />
    </div>
  );
}

export default App;