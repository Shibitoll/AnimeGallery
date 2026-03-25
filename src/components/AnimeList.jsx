import React from 'react';
import AnimeCard from './AnimeCard';

const AnimeList = ({ list, onToggleFavorite, onToggleWatched, onDeleteAnime, onUpdateRating }) => {
  
  if (!list) return <p>Завантаження...</p>;

  return (
    <div className="anime-grid">
      {list.map((anime) => (
        <AnimeCard 
            key={anime.id}
            {...anime}
            onToggleFavorite={onToggleFavorite} 
            onToggleWatched={onToggleWatched}
            isAddedByUser={anime.isAddedByUser}
            onDeleteAnime={onDeleteAnime}
            onUpdateRating={onUpdateRating}
        />
      ))}
    </div>
  );
};

export default AnimeList;