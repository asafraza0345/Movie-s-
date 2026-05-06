import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { Movie } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { Search as SearchIcon, Film, Star, Play } from "lucide-react";
import VideoPlayer from "../components/VideoPlayer";
import MovieDetails from "../components/MovieDetails";
import AdBanner from "../components/AdBanner";
import { useAuth } from "../context/AuthContext";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        // Filter out results without posters and non-movie/tv items
        setResults(data.filter(item => item.poster_path && (item.media_type === "movie" || item.media_type === "tv")));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter">GLOBAL SEARCH</h1>
            <p className="text-gray-500 uppercase text-xs font-bold tracking-widest flex items-center gap-2">
              <SearchIcon size={14} /> Showing results for: <span className="text-white">"{query}"</span>
            </p>
          </div>
          <div className="text-sm font-bold text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
            {results.length} results found
          </div>
        </div>

        {!user?.isPremium && <div className="mb-12"><AdBanner /></div>}

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {results.map((movie) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedMovie(movie)}
                className="group relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer shadow-2xl border border-white/5"
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  className="w-full h-full object-cover"
                  alt={movie.title}
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 p-4 flex flex-col justify-end">
                   <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-2xl">
                          <Play size={20} fill="currentColor" />
                        </div>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs font-black">
                          <Star size={12} fill="currentColor" /> {movie.vote_average.toFixed(1)}
                        </div>
                      </div>
                      <h3 className="font-bold text-sm text-white line-clamp-1">{movie.title || movie.name}</h3>
                      <div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        <span>{movie.media_type}</span>
                        <span>•</span>
                        <span>{new Date(movie.release_date || movie.first_air_date || "").getFullYear()}</span>
                      </div>
                   </div>
                </div>

                {/* Type Badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/60 backdrop-blur-md rounded text-[9px] font-black uppercase tracking-tighter border border-white/10">
                   {movie.media_type}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-96 flex flex-col items-center justify-center gap-6 text-gray-700 bg-white/5 rounded-3xl border border-dashed border-white/5">
            <div className="p-6 bg-white/5 rounded-full">
              <Film size={48} className="opacity-20" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-500">No results found all over the world</p>
              <p className="text-sm text-gray-600 mt-2">Try searching for movies, TV shows, or actors.</p>
            </div>
          </div>
        )}
      </div>

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
