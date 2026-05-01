import axios from 'axios';

const DJANGO_API_URL = 'http://localhost:8000/api/streaming';

export const streamingApi = {
  getTopAiring: async () => {
    const { data } = await axios.get(`${DJANGO_API_URL}/top-airing/`);
    return data.results;
  },
  getAnimeInfo: async (animeId) => {
    const { data } = await axios.get(`${DJANGO_API_URL}/info/${animeId}/`);
    return data;
  },
  getStreamingLinks: async (episodeId) => {
    const safeEpisodeId = encodeURIComponent(episodeId);
    const { data } = await axios.get(`${DJANGO_API_URL}/watch/${safeEpisodeId}/`);
    return data.sources;
  }
};