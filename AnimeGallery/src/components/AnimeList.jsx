import React from 'react';
import AnimeCard from './AnimeCard';

const AnimeList = ({ list }) => {
  return (
    <div className="cards-grid">
      {list.map((anime) => (
        <AnimeCard 
            key={anime.id} 
            title={anime.title}
            poster={anime.poster}
            rating={anime.rating}
            description={anime.description}
            year={anime.year}
            episodes={anime.episodes}
            studio={anime.studio}
            genres={anime.genres}
            status={anime.status}
        />
      ))}
    </div>
  );
};

export default AnimeList;