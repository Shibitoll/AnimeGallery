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
  const [recommendedAnime, setRecommendedAnime] = useState([]); 
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

  const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleUpdateUser = async (updatedData) => {
    setCurrentUser(prev => ({ ...prev, ...updatedData }));
    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/me/', {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username: updatedData.name, 
          email: updatedData.email
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Не вдалося оновити профіль");
      }
    } catch (error) {
      console.error("Помилка профілю:", error);
    }
  };

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setAnimeList([]);
    setRecommendedAnime([]);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    if (path === 'home') navigate('/');
    else navigate(`/${path}`);
  };

  const normalizeAnime = (data) => ({
    ...data,
    id: data.id,
    anihubId: String(data.anihubId || data.anihub_id || data.id),
    mal_id: String(data.mal_id || data.anihubId || data.anihub_id || data.id),
    titleUkrainian: data.title_ukrainian || data.titleUkrainian || data.title,
    is_favorite: !!(data.is_favorite || data.isFavorite),  
    is_watching: !!(data.is_watching || data.isWatching),   
    in_watchlist: !!(data.in_watchlist || data.isWatched),      
    planned: !!data.planned,
    user_rating: parseFloat(data.user_rating || data.userRating || 0),  
    is_added_by_user: !!(data.is_added_by_user || data.isAddedByUser),
    episodesCount: parseInt(data.episodes_count || data.episodesCount || data.episodes || 0)
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) {
        setAnimeList([]);
        setRecommendedAnime([]);
        setCurrentUser({ name: "Гість", email: "", joinedDate: "", commentsCount: 0 }); 
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // 1. Профіль
        try {
          const userRes = await fetch('http://127.0.0.1:8000/api/users/me/', { headers: getAuthHeaders() });
          if (userRes.ok) {
            const userData = await userRes.json();
            setCurrentUser({ name: userData.username, email: userData.email, joinedDate: userData.joinedDate, commentsCount: 0 });
          }
        } catch (err) { console.error(err); }

        // 2. Рекомендації
        try {
          const recRes = await fetch('http://127.0.0.1:8000/api/animes/recommended/', { headers: getAuthHeaders() });
          if (recRes.ok) {
            const recData = await recRes.json();
            setRecommendedAnime((recData.results || recData).map(normalizeAnime));
          }
        } catch (err) { console.error(err); }

        // 3. Списки юзера
        let allAnime = [];
        let nextPageUrl = 'http://127.0.0.1:8000/api/animes/';
        while (nextPageUrl) {
          const response = await fetch(nextPageUrl, { headers: getAuthHeaders() });
          if (response.status === 401) { handleLogout(); return; }
          const resJson = await response.json();
          const items = resJson.results || resJson;
          allAnime = [...allAnime, ...items.map(normalizeAnime)];
          nextPageUrl = resJson.next || null;
        }
        setAnimeList(allAnime);
      } catch (error) {
        console.error("Завантаження перервано:", error);
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
      existingAnime = animeList.find(a => String(a.anihubId) === String(animeData.anihubId));
    } else {
      existingAnime = animeList.find(a => String(a.id) === String(animeOrId) || String(a.anihubId) === String(animeOrId));
      if (!existingAnime) return;
      animeData = existingAnime;
    }

    const API_URL = 'http://127.0.0.1:8000/api/animes/';
    
    // Перетворення ключів для Django
    const djangoPayload = { ...statusUpdates };
    if (statusUpdates.isFavorite !== undefined) djangoPayload.is_favorite = statusUpdates.isFavorite;
    if (statusUpdates.isWatching !== undefined) djangoPayload.is_watching = statusUpdates.isWatching;
    if (statusUpdates.isWatched !== undefined) djangoPayload.in_watchlist = statusUpdates.isWatched;
    if (statusUpdates.userRating !== undefined) djangoPayload.user_rating = statusUpdates.userRating;

    if (existingAnime) {
      try {
        const response = await fetch(`${API_URL}${existingAnime.id}/`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(djangoPayload) 
        });
        if (response.ok) {
          const updated = normalizeAnime(await response.json());
          setAnimeList(prev => prev.map(a => a.id === existingAnime.id ? updated : a));
          setRecommendedAnime(prev => prev.map(a => a.anihubId === updated.anihubId ? updated : a));
        }
      } catch (error) { console.error(error); }
    } else {
      const newPayload = {
        titleUkrainian: animeData.titleUkrainian || animeData.title || "Без назви",
        anihubId: String(animeData.anihubId),
        mal_id: String(animeData.mal_id || animeData.anihubId), 
        description: animeData.description || "Опис відсутній",
        poster: animeData.poster || animeData.image || "https://via.placeholder.com/225x318",
        genres: Array.isArray(animeData.genres) ? animeData.genres.join(', ') : String(animeData.genres || ""),
        year: String(animeData.year || "-").substring(0, 4),
        episodesCount: parseInt(animeData.episodesCount || 0),
        type: animeData.type || "tv",
        status: animeData.status || "completed",
        rating: parseFloat(animeData.rating || 0),
        is_favorite: !!statusUpdates.isFavorite, 
        is_watching: !!statusUpdates.isWatching,
        in_watchlist: !!statusUpdates.isWatched, 
        planned: !!statusUpdates.planned,
        user_rating: parseFloat(statusUpdates.userRating || 0),
      };

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(newPayload)
        });
        if (response.ok) {
          const saved = normalizeAnime(await response.json());
          setAnimeList(prev => [saved, ...prev]);
          setRecommendedAnime(prev => prev.map(a => a.anihubId === saved.anihubId ? saved : a));
        }
      } catch (error) { console.error(error); }
    }
  };

  const toggleFavorite = (d) => {
    const id = typeof d === 'object' ? (d.anihubId || d.mal_id || d.id) : d;
    const ex = animeList.find(a => String(a.anihubId) === String(id) || String(a.id) === String(id));
    updateAnimeStatus(d, { isFavorite: ex ? !ex.is_favorite : true });
  };

  const toggleWatching = (d) => {
    const id = typeof d === 'object' ? (d.anihubId || d.mal_id || d.id) : d;
    const ex = animeList.find(a => String(a.anihubId) === String(id) || String(a.id) === String(id));
    const s = ex ? !ex.is_watching : true;
    updateAnimeStatus(d, { isWatching: s, isWatched: false, planned: false });
  };

  const toggleWatched = (d) => {
    const id = typeof d === 'object' ? (d.anihubId || d.mal_id || d.id) : d;
    const ex = animeList.find(a => String(a.anihubId) === String(id) || String(a.id) === String(id));
    const s = ex ? !ex.in_watchlist : true;
    updateAnimeStatus(d, { isWatched: s, isWatching: false, planned: false });
  };

  const togglePlanned = (d) => {
    const id = typeof d === 'object' ? (d.anihubId || d.mal_id || d.id) : d;
    const ex = animeList.find(a => String(a.anihubId) === String(id) || String(a.id) === String(id));
    const s = ex ? !ex.planned : true;
    updateAnimeStatus(d, { planned: s, isWatching: false, isWatched: false });
  };

  const updateRating = (d, r) => updateAnimeStatus(d, { userRating: r });

  const deleteAnime = async (id) => {
    if (!window.confirm("Видалити?")) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/animes/${id}/`, { method: 'DELETE', headers: getAuthHeaders() });
      if (response.ok) {
        setAnimeList(prev => prev.filter(a => a.id !== id));
        setRecommendedAnime(prev => prev.map(a => a.id === id ? { ...a, is_favorite: false, is_watching: false, in_watchlist: false, planned: false, user_rating: 0 } : a));
      }
    } catch (error) { console.error(error); }
  };

  if (loading) return <div className="loading">Завантаження...</div>;

  return (
    <ThemeProvider>
      <ScrollToTop />
      <div className="app-wrapper">
        <Header 
          favoriteCount={animeList.filter(a => a.is_favorite).length} 
          watchingCount={animeList.filter(a => a.is_watching).length}
          watchedCount={animeList.filter(a => a.in_watchlist).length}
          plannedCount={animeList.filter(a => a.planned).length}
          currentTab={currentTab} setCurrentTab={setCurrentTab} isAuthenticated={isAuthenticated} onLogout={handleLogout} userName={currentUser.name}
        />
        <Routes>
          <Route path="/login" element={<Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/register" element={<Register onNavigate={handleNavigate} />} />
          <Route path="/" element={<Main data={animeList} recommendedData={recommendedAnime} currentTab="home" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={(n) => updateAnimeStatus(n, {})} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/popular" element={<Main data={animeList} currentTab="popular" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={(n) => updateAnimeStatus(n, {})} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/new" element={<Main data={animeList} currentTab="new" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={(n) => updateAnimeStatus(n, {})} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/favorite" element={<Main data={animeList} currentTab="favorite" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/watching" element={<Main data={animeList} currentTab="watching" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/watched" element={<Main data={animeList} currentTab="watched" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/planned" element={<Main data={animeList} currentTab="planned" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/my-anime" element={<Main data={animeList} currentTab="my-anime" toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onAddAnime={(n) => updateAnimeStatus(n, {})} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="/about" element={<About />} />
          <Route path="/anime/:id" element={<AnimeDetails data={animeList} onAddAnime={(n) => updateAnimeStatus(n, {})} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onUpdateRating={updateRating} />} />
          <Route path="/search" element={<Search data={animeList} onAddAnime={(n) => updateAnimeStatus(n, {})} onToggleFavorite={toggleFavorite} onToggleWatching={toggleWatching} onToggleWatched={toggleWatched} onTogglePlanned={togglePlanned} onUpdateRating={updateRating} />} />
          <Route path="/profile" element={<Profile data={animeList} userInfo={currentUser} onUpdateUser={handleUpdateUser} toggleFavorite={toggleFavorite} toggleWatching={toggleWatching} toggleWatched={toggleWatched} togglePlanned={togglePlanned} onDeleteAnime={deleteAnime} onUpdateRating={updateRating} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;