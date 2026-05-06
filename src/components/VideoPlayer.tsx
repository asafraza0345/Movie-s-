import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Volume2, VolumeX, SkipForward, Info, Sparkles } from "lucide-react";
import { Movie } from "../types";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

export default function VideoPlayer({ movie, onClose }: VideoPlayerProps) {
  const { user } = useAuth();
  const [isAdPlaying, setIsAdPlaying] = useState(!user?.isPremium);
  const [adTimer, setAdTimer] = useState(15);
  const [isMuted, setIsMuted] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [currentServer, setCurrentServer] = useState(0);

  const servers = [
    { name: "Vidsrc Premium", url: `https://vidsrc.to/embed/movie/${movie.id}` },
    { name: "VidSource Alternative", url: `https://vidsrc.me/embed/movie?tmdb=${movie.id}` },
    { name: "Hydro HD", url: `https://embed.su/embed/movie/${movie.id}` },
    { name: "SuperEmbed", url: `https://multiembed.mov/?video_id=${movie.id}&tmdb=1` }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAdPlaying && adTimer > 0) {
      interval = setInterval(() => {
        setAdTimer((prev) => prev - 1);
      }, 1000);
    } else if (adTimer === 0) {
      setIsAdPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isAdPlaying, adTimer]);

  const movieUrl = movie.trailer_key 
    ? `https://www.youtube.com/embed/${movie.trailer_key}?autoplay=1&mute=${isMuted ? 1 : 0}`
    : servers[currentServer].url;
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black flex items-center justify-center overflow-hidden"
    >
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={32} />
          </button>
          <h2 className="text-xl font-bold">{movie.title || movie.name} {movie.trailer_key && "(Trailer)"}</h2>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAdPlaying && !movie.trailer_key && (
            <div className="flex bg-white/10 rounded-lg p-1 border border-white/5">
              {servers.map((server, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentServer(idx);
                    setVideoLoaded(false);
                  }}
                  className={cn(
                    "px-3 py-1 rounded text-[10px] font-bold transition-all",
                    currentServer === idx ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"
                  )}
                >
                  {server.name}
                </button>
              ))}
            </div>
          )}

          {isAdPlaying && (
            <div className="px-4 py-1.5 bg-yellow-500/20 border border-yellow-500/50 rounded-full flex items-center gap-2">
              <span className="text-[8px] bg-yellow-500 text-black px-1 rounded font-black">AD</span>
              <span className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Sponsored by AdMob</span>
            </div>
          )}
          <button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      <div className="relative w-full h-full max-w-7xl aspect-video bg-gray-900 shadow-3xl">
        <AnimatePresence mode="wait">
          {isAdPlaying ? (
            <motion.div 
              key="ad-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              {/* Simulated Ad Content (usually a high-res trailer) */}
              <div className="absolute inset-0 grayscale opacity-30">
                <img 
                   src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                   className="w-full h-full object-cover"
                   alt="Ad Background"
                />
              </div>

              <div className="relative z-10 text-center space-y-8 p-12">
                <div className="w-24 h-24 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <div className="space-y-2">
                  <h3 className="text-4xl font-black italic tracking-tighter">UNLOCKING CONTENT...</h3>
                  <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-[0.2em]">
                    <Info size={12} /> Google AdMob Interstitial
                  </div>
                </div>
                <p className="text-gray-400 font-medium max-w-md mx-auto">
                  Enjoy this quick ad while we set up the 4K stream for <span className="text-white">{movie.title}</span>.
                </p>
                
                <div className="text-6xl font-black text-white tabular-nums">
                  {adTimer}s
                </div>
              </div>

              {/* Skip Logic (Usually disabled till 5s) */}
              <div className="absolute bottom-12 right-12 flex flex-col items-end gap-3">
                 <button 
                  disabled={adTimer > 0}
                  className={cn(
                    "px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center gap-3 font-bold uppercase transition-all",
                    adTimer === 0 ? "bg-white text-black hover:scale-105" : "opacity-50 cursor-not-allowed"
                  )}
                 >
                   Skip Ad <SkipForward size={20} />
                 </button>
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                   Join Premium to skip all ads forever
                 </p>
              </div>

              <div className="absolute bottom-0 left-0 h-1 bg-yellow-500 transition-all duration-1000" style={{ width: `${(15 - adTimer) / 15 * 100}%` }} />
            </motion.div>
          ) : (
            <motion.div 
              key="movie-screen"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0"
            >
               {!videoLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                     <div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                  </div>
               )}
               <iframe
                src={movieUrl}
                className="w-full h-full border-0"
                allowFullScreen
                onLoad={() => setVideoLoaded(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Side Info Overlay */}
      <AnimatePresence>
        {!isAdPlaying && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="hidden xl:flex absolute right-8 top-1/2 -translate-y-1/2 w-80 bg-black/40 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 flex-col gap-6"
          >
             <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} className="rounded-xl shadow-2xl" alt="" />
             <div>
                <h4 className="font-black tracking-tight mb-2">{movie.title}</h4>
                <p className="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-4">{movie.overview}</p>
                <div className="flex gap-2">
                   <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">4K ULTRA HD</span>
                   <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">5.1 AUDIO</span>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
