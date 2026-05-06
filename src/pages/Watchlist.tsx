import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { Movie } from "../types";
import { api } from "../services/api";
import MovieRow from "../components/MovieRow";
import MovieDetails from "../components/MovieDetails";
import VideoPlayer from "../components/VideoPlayer";
import AdBanner from "../components/AdBanner";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Film, Play } from "lucide-react";

export default function Watchlist() {
  const { user } = useAuth();
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchWatchlist = async () => {
      if (!user || user.watchlist.length === 0) {
        setWatchlistMovies([]);
        setLoading(false);
        return;
      }

      try {
        const moviePromises = user.watchlist.map(id => api.getDetails("movie", id));
        const movies = await Promise.all(moviePromises);
        setWatchlistMovies(movies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchlist();
  }, [user]);

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Bookmark className="text-gray-700" size={64} />
        <h1 className="text-2xl font-bold">Please sign in to view your watchlist</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 md:px-12">
      <div className="flex items-center gap-4 mb-12">
        <div className="p-3 bg-red-600/10 rounded-2xl border border-red-600/20">
          <Film className="text-red-600" size={32} />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tighter">My List</h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest">{watchlistMovies.length} Titles Saved</p>
        </div>
      </div>

      {!user.isPremium && <div className="mb-12"><AdBanner /></div>}

      {loading ? (
        <div className="h-64 flex items-center justify-center">
           <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : watchlistMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {watchlistMovies.map((movie) => (
             <motion.div
               key={movie.id}
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               onClick={() => setSelectedMovie(movie)}
               className="group relative aspect-[2/3] rounded-lg overflow-hidden cursor-pointer shadow-2xl transition-transform hover:scale-105"
             >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  className="w-full h-full object-cover"
                  alt={movie.title}
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                   <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mb-2">
                      <Play size={24} fill="currentColor" />
                   </div>
                   <h3 className="font-bold text-sm mb-1">{movie.title || movie.name}</h3>
                   <span className="text-[10px] uppercase font-bold text-gray-400">
                    {new Date(movie.release_date || movie.first_air_date || "").getFullYear()}
                   </span>
                </div>
             </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-96 flex flex-col items-center justify-center gap-4 text-gray-600 border-2 border-dashed border-gray-900 rounded-3xl">
           <Bookmark size={48} />
           <p className="text-xl font-medium">Your watchlist is empty</p>
           <p className="text-sm">Start adding movies to see them here.</p>
        </div>
      )}

      <AnimatePresence>
        {selectedMovie && (
          <MovieDetails 
            movie={selectedMovie} 
            onClose={() => setSelectedMovie(null)} 
            onPlay={(m) => {
              setSelectedMovie(null);
              setActiveMovie(m);
            }} 
            onMovieSelect={(m) => setSelectedMovie(m)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeMovie && (
          <VideoPlayer movie={activeMovie} onClose={() => setActiveMovie(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
