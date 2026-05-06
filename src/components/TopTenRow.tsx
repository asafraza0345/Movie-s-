import { useRef, useState } from "react";
import { Movie } from "../types";
import { ChevronLeft, ChevronRight, Play, Plus, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";

interface TopTenRowProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

export default function TopTenRow({ movies, onPlay }: TopTenRowProps) {
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
    <div className="space-y-4 px-6 md:px-12 group/row relative py-10">
      <div className="flex items-center gap-3">
        <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
          Top 10 Movies Today
        </h2>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-red-600 to-transparent" />
      </div>

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
          className="flex gap-4 overflow-x-scroll scrollbar-hide pb-8 pt-4 no-scrollbar pr-20"
        >
          {movies.slice(0, 10).map((movie, index) => (
            <div key={movie.id} className="relative flex-shrink-0 flex items-end">
              <div className="absolute -left-4 -bottom-6 z-10 select-none">
                 <span className="text-[180px] font-black leading-none text-black stroke-white stroke-2" style={{ WebkitTextStroke: '4px #333' }}>
                    {index + 1}
                 </span>
              </div>
              <div 
                className="relative w-[180px] md:w-[220px] aspect-[2/3] ml-12 cursor-pointer transform transition-all duration-300 hover:z-50 hover:scale-110"
                onClick={() => onPlay(movie)}
              >
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  className="w-full h-full object-cover rounded-lg shadow-2xl border border-white/5"
                  alt={movie.title}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
