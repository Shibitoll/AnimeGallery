import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { streamingApi } from '../api/streamingApi';

const VideoPlayer = ({ episodeId, poster }) => {
  const [streamingLinks, setStreamingLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLinks = async () => {
      if (!episodeId) return;
      
      try {
        setLoading(true);
        setError(null);
        // Звертаємось до нашого Django бекенду за посиланнями
        const sources = await streamingApi.getStreamingLinks(episodeId);
        setStreamingLinks(sources || []);
      } catch (err) {
        console.error("Помилка завантаження відео:", err);
        setError("Не вдалося завантажити відео для цього епізоду.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, [episodeId]);

  if (loading) {
    return (
      <div className="player-wrapper" style={{ padding: '60px', textAlign: 'center', background: '#000', color: '#fff', borderRadius: '12px' }}>
        Завантаження плеєра...
      </div>
    );
  }

  if (error || streamingLinks.length === 0) {
    return (
      <div className="player-wrapper" style={{ padding: '60px', textAlign: 'center', background: '#000', color: '#fff', borderRadius: '12px' }}>
        <p>{error || "На жаль, відео тимчасово недоступне."}</p>
      </div>
    );
  }

  return (
    <div className="player-wrapper" style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
      <ReactPlayer 
        url={streamingLinks[0]?.url}
        controls={true}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0 }}
        playing={false} 
        config={{
          file: {
            attributes: {
              poster: poster || ''
            }
          }
        }}
      />
    </div>
  );
};

export default VideoPlayer;