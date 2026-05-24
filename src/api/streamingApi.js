import axios from 'axios';
import { getAccessToken } from './authApi';

const PROXY_URL = 'http://127.0.0.1:8000/api/proxy/';
const BACKEND_URL = 'http://127.0.0.1:8000/api/animes/'; 

export const streamingApi = {
  getPopular: async (page = 1) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: 'anime', ordering: '-rating', page: page, page_size: 20 }
    });
    return data;
  },

  getTopAiring: async (page = 1) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: 'anime', status: 'ongoing', ordering: '-updated_at', page: page, page_size: 20 }
    });
    return data;
  },

  getAnimeInfo: async (animeId) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: `anime/${animeId}` }
    });
    return data;
  },

  searchAnime: async (query) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: 'anime', search: query, page_size: 5 }
    });
    return data;
  },

  searchAnimeList: async (query) => {
    const params = { path: 'anime', page_size: 24 };
    if (query) params.search = query; 
    
    try {
        const { data } = await axios.get(PROXY_URL, { params });
        return data.items || data.results || (Array.isArray(data) ? data : []);
    } catch (error) {
        console.warn("API повернуло помилку, повертаємо порожній масив", error);
        return []; 
    }
  },

  getScreenshots: async (animeId) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: `anime/${animeId}` }
    });
    return data.screenshots || [];
  },

  getGalleryTop: async () => {
    try {
        const { data } = await axios.get(`${BACKEND_URL}top/`);
        return data;
    } catch (error) {
        console.error("Помилка завантаження ТОПу AnimeGallery", error);
        return [];
    }
  },

  getComments: async (anihubId) => {
    try {
        const { data } = await axios.get(`${BACKEND_URL}comments/${anihubId}/`);
        return data;
    } catch (error) {
        console.error("Помилка завантаження коментарів", error);
        return [];
    }
  },

  postComment: async (anihubId, text, title) => {
    const token = getAccessToken();
    if (!token) throw new Error("Необхідно увійти в систему");

    const { data } = await axios.post(
        `${BACKEND_URL}comments/${anihubId}/`,
        { text, title },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return data;
  },

  editComment: async (commentId, text) => {
    const token = getAccessToken();
    if (!token) throw new Error("Необхідно увійти в систему");

    const { data } = await axios.put(
        `${BACKEND_URL}comment/${commentId}/`,
        { text },
        { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
    );
    return data;
  },

  deleteComment: async (commentId) => {
    const token = getAccessToken();
    if (!token) throw new Error("Необхідно увійти в систему");

    await axios.delete(
        `${BACKEND_URL}comment/${commentId}/`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
  },

  // Отримання статистики коментарів користувача для профілю
  getUserCommentsStats: async () => {
    const token = getAccessToken();
    if (!token) return { total_comments: 0, most_commented: [] };

    try {
        const { data } = await axios.get(`${BACKEND_URL}user-comments-stats/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return data;
    } catch (error) {
        console.error("Помилка завантаження статистики коментарів", error);
        return { total_comments: 0, most_commented: [] };
    }
  }
};