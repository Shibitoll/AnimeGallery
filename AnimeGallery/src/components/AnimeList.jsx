import React from 'react';
import AnimeCard from './AnimeCard';

const AnimeList = ({ list, onToggleFavorite, onToggleWatched, onDeleteAnime }) => {
  
  if (!list) return <p>Завантаження...</p>;

  return (
    <div className="anime-grid">
      {list.map((anime) => (
        <AnimeCard 
            key={anime.id}
            id={anime.id} 
            title={anime.title}
            poster={anime.poster}
            rating={anime.rating}
            description={anime.description}
            year={anime.year}
            episodes={anime.episodes}
            studio={anime.studio}
            genres={anime.genres}
            status={anime.status}
            isFavorite={anime.isFavorite} 
            isWatched={anime.isWatched}   
            onToggleFavorite={onToggleFavorite} 
            onToggleWatched={onToggleWatched}
            isAddedByUser={anime.isAddedByUser}
            onDeleteAnime={onDeleteAnime}
        />
      ))}
    </div>
  );
};

export default AnimeList;