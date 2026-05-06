import { motion, AnimatePresence } from "motion/react";
import { X, Play, Loader2, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Movie } from "../types";

interface PersonDetailsProps {
  person: {
    id: number;
    name: string;
    profile_path: string | null;
  };
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export default function PersonDetails({ person, onClose, onMovieSelect }: PersonDetailsProps) {
  const [credits, setCredits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const data = await api.getPersonCredits(person.id.toString());
        // Sort by popularity and filter out items without posters
        const filtered = data.cast
          .filter((item: any) => item.poster_path)
          .sort((a: any, b: any) => b.popularity - a.popularity);
        setCredits(filtered);
      } catch (err) {
        console.error("Failed to fetch person credits:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCredits();
  }, [person.id]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl max-h-[85vh] bg-[#0c141a] rounded-2xl overflow-hidden shadow-2xl border border-white/5 flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400/50">
              <img 
                src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "https://via.placeholder.com/185x185"} 
                className="w-full h-full object-cover"
                alt={person.name}
              />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight leading-none">{person.name}</h2>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">Filmography</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-500">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-bold tracking-widest uppercase text-sm">Fetching Credits...</p>
            </div>
          ) : credits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {credits.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    onMovieSelect(item);
                    onClose();
                  }}
                  className="group cursor-pointer space-y-2"
                >
                  <div className="aspect-[2/3] rounded-lg overflow-hidden relative shadow-lg border border-white/5">
                    <img 
                      src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      alt={item.title || item.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
                        <Play size={16} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-white text-[10px] font-black leading-tight line-clamp-1 flex-1">{item.title || item.name}</p>
                      {item.vote_average > 0 && (
                        <div className="flex items-center gap-0.5 text-[8px] font-black text-[#f5c518] shrink-0">
                          <Star size={8} fill="currentColor" />
                          {item.vote_average.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-gray-500 text-[9px] font-bold uppercase tracking-tighter line-clamp-1">
                        {item.character || (item.media_type === "movie" ? "Movie" : "TV Show")}
                      </p>
                      <p className="text-gray-600 text-[9px] font-bold shrink-0">
                        {new Date(item.release_date || item.first_air_date || "").getFullYear() || ""}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="font-bold tracking-widest uppercase text-sm">No credits found</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
