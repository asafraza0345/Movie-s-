import { useRef, useState, useEffect } from "react";
import { Movie } from "../types";
import { ChevronLeft, ChevronRight, Star, Play, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useAuth } from "../context/AuthContext";

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

export default function MovieRow({ title, movies, onPlay }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 px-6 md:px-12 group/row">
      <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white/90">
        {title}
      </h2>

      <div 
        className="relative"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <AnimatePresence>
          {showControls && (
            <>
              <button 
                onClick={() => scroll("left")}
                className="absolute left-0 top-0 bottom-0 z-40 bg-black/50 w-12 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
              >
                <ChevronLeft size={32} />
              </button>
              <button 
                onClick={() => scroll("right")}
                className="absolute right-0 top-0 bottom-0 z-40 bg-black/50 w-12 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover/row:opacity-100"
              >
                <ChevronRight size={32} />
              </button>
            </>
          )}
        </AnimatePresence>

        <div 
          ref={rowRef}
          className="flex gap-4 overflow-x-scroll scrollbar-hide pb-8 pt-4 no-scrollbar"
        >
          {movies.map((movie, index) => (
            <MovieCard key={`${movie.id}-${index}`} movie={movie} onPlay={onPlay} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MovieCard({ movie, onPlay }: { movie: Movie; onPlay: (movie: Movie) => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const { user, updateWatchlist } = useAuth();
  const isInWatchlist = user?.watchlist.includes(movie.id.toString());

  return (
    <div 
      className="relative min-w-[200px] md:min-w-[240px] aspect-[2/3] rounded-lg cursor-pointer transform transition-all duration-300 hover:z-50 hover:scale-110"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(movie)}
    >
      <img 
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
        className="w-full h-full object-cover rounded-lg shadow-xl"
        alt={movie.title}
      />

      <AnimatePresence>
        {isHovered && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-4 flex flex-col justify-end rounded-lg overflow-hidden border border-white/20"
          >
             <div className="space-y-2">
                <div className="flex items-center justify-between">
                   <div className="flex gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlay(movie);
                        }}
                        className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200"
                      >
                        <Play size={16} fill="currentColor" />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateWatchlist(movie.id.toString(), isInWatchlist ? "remove" : "add");
                        }}
                        className="w-8 h-8 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center hover:bg-gray-700"
                      >
                        {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
                      </button>
                   </div>
                   <div className="flex items-center gap-1 text-yellow-500 text-sm font-bold">
                      <Star size={12} fill="currentColor" /> {movie.vote_average.toFixed(1)}
                   </div>
                </div>
                <h3 className="font-bold text-sm truncate">{movie.title || movie.name}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <span>{movie.media_type || "Movie"}</span>
                    <span>•</span>
                    <span>{new Date(movie.release_date || movie.first_air_date || "").getFullYear()}</span>
                  </div>
                  {movie.original_language && (
                     <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30 uppercase">
                       {movie.original_language === 'en' ? 'INTL' : movie.original_language}
                     </span>
                  )}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
