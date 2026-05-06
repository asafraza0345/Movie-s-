import React, { createContext, useContext, useState, useEffect } from "react";
import { Movie } from "../types";

export interface DownloadedItem extends Movie {
  id: string; // Ensure id is string for local lookup
  downloadDate: string;
  size: string;
}

interface DownloadContextType {
  downloadedItems: DownloadedItem[];
  downloadingIds: Set<string>;
  startDownload: (movie: Movie) => void;
  isItemDownloaded: (id: string) => boolean;
  removeItem: (id: string) => void;
}

const DownloadContext = createContext<DownloadContextType | undefined>(undefined);

export function DownloadProvider({ children }: { children: React.ReactNode }) {
  const [downloadedItems, setDownloadedItems] = useState<DownloadedItem[]>([]);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("movie_downloads");
    if (saved) {
      try {
        setDownloadedItems(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse downloads", e);
      }
    }

    // Listen for SW messages
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'DOWNLOAD_COMPLETE') {
        const { movieId, title } = event.data.payload;
        setDownloadingIds(prev => {
          const next = new Set(prev);
          next.delete(movieId);
          return next;
        });
        
        // Find the movie metadata we were downloading
        // In a real app we'd pass the whole movie object back or store it temporarily
        // For simplicity, we'll just check if it's already in the downloaded list
        console.log(`Download complete: ${title}`);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage);
  }, []);

  const saveToStorage = (items: DownloadedItem[]) => {
    localStorage.setItem("movie_downloads", JSON.stringify(items));
  };

  const startDownload = (movie: Movie) => {
    const movieId = movie.id.toString();
    if (downloadingIds.has(movieId) || isItemDownloaded(movieId)) return;

    setDownloadingIds(prev => new Set(prev).add(movieId));

    // Prepare assets to cache
    const assets = [
      movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : '',
    ].filter(Boolean);

    // Send to SW
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'START_DOWNLOAD',
        payload: {
          movieId,
          title: movie.title || movie.name,
          assets
        }
      });
    }

    // Simulate completion after delay for UI feedback
    setTimeout(() => {
      const newItem: DownloadedItem = {
        ...movie,
        downloadDate: new Date().toISOString(),
        size: `${Math.floor(Math.random() * 500 + 400)} MB`
      };
      
      setDownloadedItems(prev => {
        const updated = [...prev, newItem];
        saveToStorage(updated);
        return updated;
      });
      
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(movieId);
        return next;
      });
    }, 3000);
  };

  const isItemDownloaded = (id: string) => {
    return downloadedItems.some(item => item.id.toString() === id.toString());
  };

  const removeItem = (id: string) => {
    setDownloadedItems(prev => {
      const updated = prev.filter(item => item.id.toString() !== id.toString());
      saveToStorage(updated);
      return updated;
    });
  };

  return (
    <DownloadContext.Provider value={{ 
      downloadedItems, 
      downloadingIds, 
      startDownload, 
      isItemDownloaded,
      removeItem 
    }}>
      {children}
    </DownloadContext.Provider>
  );
}

export const useDownloads = () => {
  const context = useContext(DownloadContext);
  if (!context) throw new Error("useDownloads must be used within DownloadProvider");
  return context;
};
