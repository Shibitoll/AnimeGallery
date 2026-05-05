import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Header from './components/Header';
import Main from './components/Main';
import Footer from './components/Footer';
import About from './pages/About';
import Profile from './pages/Profile';
import AnimeDetails from './pages/AnimeDetails';
import NotFound from './pages/NotFound';
import { ThemeProvider } from './context/ThemeContext';
import Search from './pages/Search';
import Login from './pages/Login';
import Register from './pages/Register';
import { getAccessToken, clearTokens } from './api/authApi';
import ScrollToTop from './components/ScrollToTop';
import './styles/App.css';

function App() {
  const [animeList, setAnimeList] = useState([]);
  const [currentTab, setCurrentTab] = useState('home');
  const [loading, setLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: "Завантаження...",
    email: "",
    joinedDate: "...",
    commentsCount: 0
  });

  const handleUpdateUser = async (updatedData) => {
    // 1. Відразу оновлюємо візуально (Optimistic UI)
    setCurrentUser(prev => ({ ...prev, ...updatedData }));

    // 2. Відправляємо запит до бекенду
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: updatedData.name, // Django очікує поле 'username'
          email: updatedData.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Не вдалося оновити профіль в базі даних");
        // Якщо сталася помилка, можна було б відкотити зміни назад,
        // але для простоти поки що просто повідомимо користувача
      }
    } catch (error) {
      console.error("Помилка відправки даних профілю:", error);
    }
  };

  const API_URL = 'http://127.0.0.1:8000/api/animes/';

  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setAnimeList([]);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    if (path === 'home') navigate('/');
    else navigate(`/${path}`);
  };

  const normalizeAnime = (data) => ({
    ...data,
    id: data.id,
    mal_id: String(data.mal_id || data.id),
    is_favorite: !!data.isFavorite,  
    is_watching: !!data.isWatching,   // БЕРЕМО isFavorite ВІД DJANGO
    in_watchlist: !!data.isWatched,     // БЕРЕМО isWatched ВІД DJANGO
    planned: !!data.planned,
    user_rating: data.userRating || 0,  // БЕРЕМО userRating ВІД DJANGO
    is_added_by_user: !!data.isAddedByUser,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setAnimeList([]);
        setCurrentUser({ name: "Гість", email: "", joinedDate: "", commentsCount: 0 }); // Скидаємо при виході
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // --- 1. ОТРИМУЄМО ДАНІ КОРИСТУВАЧА ---
        try {
          const userRes = await fetch('http://127.0.0.1:8000/api/users/me/', { headers: getAuthHeaders() });
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentUser({
              name: userData.username,
              email: userData.email,
              joinedDate: userData.joinedDate,
              commentsCount: 0 // Залишаємо 0, поки не підключимо реальні коментарі
            });
          }
        } catch (err) {
          console.error("Не вдалося завантажити профіль:", err);
        }

        // --- 2. ОТРИМУЄМО АНІМЕ ---
        let allAnime = [];
        let nextPageUrl = API_URL;

        while (nextPageUrl) {
          const response = await fetch(nextPageUrl, { headers: getAuthHeaders() });

          if (response.status === 401) {
             handleLogout();
             throw new Error('Сесія закінчилась.');
          }
          if (!response.ok) throw new Error('Помилка мережі');
          
          const data = await response.json();
          if (data.results) {
            allAnime = [...allAnime, ...data.results.map(normalizeAnime)];
          } else {
            allAnime = data.map(normalizeAnime);
          }
          nextPageUrl = data.next || null;
        }
        setAnimeList(allAnime);
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  const updateAnimeStatus = async (animeOrId, statusUpdates) => {
    let animeData;
    let existingAnime;

    if (typeof animeOrId === 'object' && animeOrId !== null) {
      animeData = normalizeAnime(animeOrId);
      existingAnime = animeList.find(a => 
        String(a.id) === String(animeData.id) || String(a.mal_id) === String(animeData.mal_id)
      );
    } else {
      existingAnime = animeList.find(a => String(a.id) === String(animeOrId) || String(a.mal_id) === String(animeOrId));
      if (!existingAnime) return;
      animeData = existingAnime;
    }

    if (existingAnime) {
      // PATCH-запит (якщо аніме вже в базі)
      try {
        const response = await fetch(`${API_URL}${existingAnime.id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(statusUpdates) // Django очікує camelCase!
        });
        if (response.ok) {
          const updated = normalizeAnime(await response.json());
          setAnimeList(prev => prev.map(a => a.id === existingAnime.id ? updated : a));
        }
      } catch (error) { console.error("Помилка оновлення:", error); }
    } else {
      // POST-запит (якщо це нове аніме з вкладки Популярні)
      let parsedGenres = "Невідомо";
      if (Array.isArray(animeData.genres)) {
        parsedGenres = animeData.genres.map(g => typeof g === 'object' ? (g.name || '') : g).join(', ');
      } else if (animeData.genres) parsedGenres = animeData.genres;
      if (parsedGenres.length > 255) parsedGenres = parsedGenres.substring(0, 250) + "...";

      const newAnimePayload = {
        title: animeData.title || "Без назви",
        mal_id: String(animeData.mal_id), 
        description: animeData.description || "Опис відсутній",
        poster: animeData.poster || "https://via.placeholder.com/225x318",
        genres: parsedGenres,
        year: String(animeData.year || "-").substring(0, 4),
        episodes: String(animeData.episodes || "-"),
        studio: animeData.studio || "Невідомо",
        rating: parseFloat(animeData.rating) || 0.0,
        userRating: 0.0, 
        isFavorite: false, 
        isWatching: false,
        isWatched: false, 
        planned: false,
        isAddedByUser: false,
        ...statusUpdates // Передаємо статус у правильному форматі
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newAnimePayload)
        });
        if (response.ok) {
          const savedAnime = normalizeAnime(await response.json());
          setAnimeList(prev => [savedAnime, ...prev]);
        }
      } catch (error) { console.error("Помилка створення:", error); }
    }
  };

  const getAnimeId = (data) => typeof data === 'object' ? (data.mal_id || data.id) : data;

  const toggleFavorite = (data) => {
    const id = getAnimeId(data);
    const existing = animeList.find(a => String(a.id) === String(id) || String(a.mal_id) === String(id));
    const newStatus = existing ? !existing.is_favorite : true;
    updateAnimeStatus(data, { isFavorite: newStatus });
  };

  const toggleWatching = (data) => {
    const id = getAnimeId(data);
    const existing = animeList.find(a => String(a.id) === String(id) || String(a.mal_id) === String(id));
    const newStatus = existing ? !existing.is_watching : true;
    updateAnimeStatus(data, { 
      isWatching: newStatus,
      ...(newStatus ? { planned: false, isWatched: false } : {})
    });
  };

  const toggleWatched = (data) => {
    const id = getAnimeId(data);
    const existing = animeList.find(a => String(a.id) === String(id) || String(a.mal_id) === String(id));
    const newStatus = existing ? !existing.in_watchlist : true;
    updateAnimeStatus(data, { 
      isWatched: newStatus,
      ...(newStatus ? { isWatching: false, planned: false } : {})
    });
  };

  const togglePlanned = (data) => {
    const id = getAnimeId(data);
    const existing = animeList.find(a => String(a.id) === String(id) || String(a.mal_id) === String(id));
    const newStatus = existing ? !existing.planned : true;
    updateAnimeStatus(data, { 
      planned: newStatus,
      ...(newStatus ? { isWatching: false, isWatched: false } : {})
    });
  };

  const updateRating = (data, newRating) => {
    updateAnimeStatus(data, { userRating: newRating }); // Відправляємо userRating
  };

  const addAnime = async (newAnime) => {
    const isFromJikan = !!(newAnime.mal_id || newAnime.id); 
    const animeDataToSend = {
      ...newAnime,
      isAddedByUser: newAnime.is_added_by_user !== undefined ? newAnime.is_added_by_user : !isFromJikan 
    };
    
    delete animeDataToSend.is_added_by_user;
    delete animeDataToSend.is_favorite;
    delete animeDataToSend.in_watchlist;
    delete animeDataToSend.user_rating;

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(animeDataToSend)
      });
      
      if (response.ok) {
        const savedAnime = normalizeAnime(await response.json());
        setAnimeList(prev => [savedAnime, ...prev]);
      }
    } catch (error) {
      console.error("Помилка при додаванні:", error);
    }
  };

  const deleteAnime = async (id) => {
    if (!window.confirm("Видалити це аніме з вашого списку?")) return;
    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (response.ok) setAnimeList(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Помилка видалення:", error);
    }
  };

  if (loading) return <div className="loading">Завантаження...</div>;

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="app-wrapper">
        <Header 
          favoriteCount={animeList.filter(a => a.is_favorite).length} 
          watchingCount={animeList.filter(a => a.isWatching).length}
          watchedCount={animeList.filter(a => a.in_watchlist).length}
          plannedCount={animeList.filter(a => a.planned).length}
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userName={currentUser.name}
        />
        
        <Routes>
          <Route path="/login" element={<Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onNavigate={handleNavigate} />} />

          <Route path="/" element={<Main data={animeList} currentTab="home" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/popular" element={<Main data={animeList} currentTab="popular" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/new" element={<Main data={animeList} currentTab="new" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/favorite" element={<Main data={animeList} currentTab="favorite" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/watching" element={<Main data={animeList} currentTab="watching" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/watched" element={<Main data={animeList} currentTab="watched" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/planned" element={<Main data={animeList} currentTab="planned" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/my-anime" element={<Main data={animeList} currentTab="my-anime" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={addAnime} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/about" element={<About />} />
          
          <Route path="/anime/:id" element={<AnimeDetails data={animeList} onAddAnime={addAnime} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onUpdateRating={updateRating} />} />
          <Route path="/search" element={<Search data={animeList} onAddAnime={addAnime} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onUpdateRating={updateRating} />} />
          <Route path="/profile" element={
            <Profile 
              data={animeList} 
              userInfo={currentUser}
              onUpdateUser={handleUpdateUser}
              toggleFavorite={toggleFavorite} 
              toggleWatching={toggleWatching} 
              toggleWatched={toggleWatched} 
              togglePlanned={togglePlanned} 
              onDeleteAnime={deleteAnime} 
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