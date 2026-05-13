import axios from 'axios';

const PROXY_URL = 'http://127.0.0.1:8000/api/proxy/';

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

  // Живий пошук (підказки в хедері та на сторінці) - 5 результатів, працює ідеально
  searchAnime: async (query) => {
    const { data } = await axios.get(PROXY_URL, {
      params: { path: 'anime', search: query, page_size: 5 }
    });
    return data;
  },

  // ОСНОВНИЙ ПОШУК ДЛЯ СТОРІНКИ: Зменшили page_size з 100 до безпечних 24, щоб уникнути помилки 422
  searchAnimeList: async (query) => {
    const params = { path: 'anime', page_size: 24 }; // 24 - безпечний ліміт
    if (query) params.search = query; 
    
    try {
        const { data } = await axios.get(PROXY_URL, { params });
        // Безпечно повертаємо масив
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
  }
};