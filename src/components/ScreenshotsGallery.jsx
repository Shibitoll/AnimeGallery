import React, { useState, useEffect } from 'react';
import { streamingApi } from '../api/streamingApi';
// import './VideoPlayer.css'; // Залиш свій імпорт стилів

const ScreenshotsGallery = ({ animeId }) => {
  const [screenshots, setScreenshots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScreenshots = async () => {
      if (!animeId) return;
      
      try {
        setLoading(true);
        const images = await streamingApi.getScreenshots(animeId);
        setScreenshots(images);
      } catch (error) {
        console.error("Помилка завантаження кадрів:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchScreenshots();
  }, [animeId]);

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Завантаження кадрів...</div>;
  }

  if (!screenshots || screenshots.length === 0) {
    return <div className="p-4 text-center text-gray-500">Кадри для цього аніме поки відсутні.</div>;
  }

  return (
    <div className="screenshots-container mt-8">
      <h3 className="text-2xl font-bold mb-4">Кадри з епізодів</h3>
      {/* Використовуємо CSS Grid для красивої сітки */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {screenshots.map((imgUrl, index) => (
          <div key={index} className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <img 
              src={imgUrl} 
              alt={`Кадр ${index + 1}`} 
              className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScreenshotsGallery;