import { motion, AnimatePresence } from "motion/react";
import { X, Play, Plus, ThumbsUp, ThumbsDown, Share2, Info, Cast, ChevronRight, Globe, Check, Loader2, Star } from "lucide-react";
import { Movie } from "../types";
import { useAuth } from "../context/AuthContext";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import PersonDetails from "./PersonDetails";

const GENRES: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics"
};

interface MovieDetailsProps {
  movie: Movie;
  onClose: () => void;
  onPlay: (movie: Movie) => void;
  onMovieSelect?: (movie: Movie) => void;
}

export default function MovieDetails({ movie, onClose, onPlay, onMovieSelect }: MovieDetailsProps) {
  const { user, updateWatchlist } = useAuth();
  const navigate = useNavigate();
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [seasonDetails, setSeasonDetails] = useState<any>(null);
  const [loadingSeason, setLoadingSeason] = useState(false);
  const isInWatchlist = user?.watchlist.includes(movie.id.toString());
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const type = movie.media_type || "movie";
        const data = await api.getDetails(type, movie.id.toString());
        setDetails(data);
        if (type === "tv" && data.seasons && data.seasons.length > 0) {
          // Find first actual season (often season 1, but sometimes season 0 is specials)
          const firstSeason = data.seasons.find((s: any) => s.season_number > 0) || data.seasons[0];
          setSelectedSeason(firstSeason.season_number);
        }
      } catch (err) {
        console.error("Failed to fetch details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [movie]);

  useEffect(() => {
    const fetchSeason = async () => {
      if ((movie.media_type === "tv" || !movie.media_type && details?.type === "tv") && movie.id) {
        setLoadingSeason(true);
        try {
          const data = await api.getTvSeason(movie.id.toString(), selectedSeason);
          setSeasonDetails(data);
        } catch (err) {
          console.error("Failed to fetch season details:", err);
        } finally {
          setLoadingSeason(false);
        }
      }
    };
    if (details) fetchSeason();
  }, [selectedSeason, movie.id, details]);

  const releaseYear = new Date(movie.release_date || movie.first_air_date || "").getFullYear();
  const rating = movie.vote_average ? (movie.vote_average * 10).toFixed(0) : "85";

  const movieGenres = movie.genre_ids 
    ? movie.genre_ids.map(id => ({ id, name: GENRES[id] })).filter(g => g.name)
    : (details?.genres ? details.genres : []);

  const trailer = details?.videos?.results?.find(
    (video: any) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser")
  );

  const handleGenreClick = (genreName: string) => {
    onClose();
    navigate(`/search?q=${encodeURIComponent(genreName)}`);
  };

  const handlePlayTrailer = () => {
    if (trailer) {
      onPlay({
        ...movie,
        trailer_key: trailer.key
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black overflow-y-auto no-scrollbar md:flex md:items-center md:justify-center md:p-8"
    >
      {/* Background overlay for desktop */}
      <div className="hidden md:block absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="relative w-full max-w-4xl bg-[#0f171e] min-h-screen md:min-h-0 md:rounded-3xl overflow-hidden shadow-4xl"
      >
        {/* Header Image Area */}
        <div className="relative aspect-video w-full">
          <img 
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            className="w-full h-full object-cover"
            alt={movie.title}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/20 to-transparent" />
          
          {/* Top Actions */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
            <button 
              onClick={onClose}
              className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-colors"
            >
              <X size={24} />
            </button>
            <button className="p-2 bg-black/40 backdrop-blur-md rounded-full text-white">
              <Cast size={24} />
            </button>
          </div>

          {/* Brand Logo Overly (Simulating Prime/Cinemax) */}
          <div className="absolute top-4 right-4 opacity-80 scale-75 origin-top-right">
             <div className="flex flex-col items-end">
                <span className="text-blue-400 font-black italic text-2xl tracking-tighter">premium</span>
                <div className="w-16 h-1 bg-blue-400 rounded-full mt-[-4px] blur-[1px]" />
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-6 pb-12 -mt-12 relative z-10 space-y-6">
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm font-bold tracking-tight">#{Math.floor(Math.random() * 10) + 1} in Global</span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400 text-sm font-bold">Trending Now</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none">
               {movie.title || movie.name}
             </h1>

             {/* Rating Section */}
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-[#f5c518] text-black px-2 py-1 rounded font-black text-xs uppercase tracking-tighter">
                   <Star size={14} fill="currentColor" />
                   IMDb {movie.vote_average?.toFixed(1) || "7.8"}
                </div>
                {details?.external_ids?.imdb_id && (
                  <a 
                    href={`https://www.imdb.com/title/${details.external_ids.imdb_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-xs font-bold underline decoration-blue-400/30"
                  >
                    View on IMDb
                  </a>
                )}
             </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-yellow-500 font-bold">
             <div className="p-1 bg-yellow-500/10 rounded">
                <Info size={14} />
             </div>
             <span>Watch with a Premium membership</span>
          </div>

          {/* Primary CTA */}
          <button 
            onClick={() => onPlay(movie)}
            className="w-full bg-white text-black font-bold py-4 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-all transform active:scale-[0.98] shadow-2xl"
          >
             <span className="text-lg">Watch With Premium</span>
          </button>

          {/* Action Icons Row */}
          <div className="flex justify-between items-start px-2 py-2">
            {trailer && (
              <ActionButton 
                icon={<div className="border-2 border-current rounded p-0.5"><Play size={18} fill="currentColor" /></div>} 
                label="Trailer" 
                onClick={handlePlayTrailer}
              />
            )}
            <ActionButton 
              icon={isInWatchlist ? <Check size={28} className="text-red-500" /> : <Plus size={28} />} 
              label="Watchlist" 
              onClick={(e) => {
                e?.stopPropagation();
                updateWatchlist(movie.id.toString(), isInWatchlist ? "remove" : "add");
              }}
            />
            <ActionButton icon={<ThumbsUp size={24} />} label="Like" />
            <ActionButton icon={<ThumbsDown size={24} />} label="Not for me" />
            <ActionButton icon={<Share2 size={24} />} label="Share" />
          </div>

          {/* Description */}
          <p className="text-gray-300 text-base leading-snug line-clamp-3 md:line-clamp-none font-medium">
            {movie.overview}
          </p>

          {/* Metadata Grid */}
          <div className="space-y-6 pt-4">
             {loading ? (
               <div className="flex items-center gap-2 text-gray-500 animate-pulse text-sm">
                 <Loader2 className="animate-spin" size={16} /> Loading metadata...
               </div>
             ) : (
               <>
                 {movieGenres.length > 0 && (
                   <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-bold text-gray-400">
                      {movieGenres.map((genre, idx) => (
                        <div key={genre.id || idx} className="flex items-center gap-2">
                           <button 
                             onClick={() => handleGenreClick(genre.name)}
                             className="hover:text-white transition-colors cursor-pointer"
                           >
                             {genre.name}
                           </button>
                           {idx < movieGenres.length - 1 && <span className="text-[8px] opacity-40">•</span>}
                        </div>
                      ))}
                   </div>
                 )}

                 <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-gray-400 font-bold">{releaseYear}</span>
                    <span className="text-gray-400 font-bold">
                      {details?.media_type === "tv" || details?.number_of_seasons 
                        ? `${details.number_of_seasons} Seasons` 
                        : `${details?.runtime || "142"} min`}
                    </span>
                    <Badge label="NEW MOVIE" className="bg-white/10 border-none text-white px-3" />
                    <Badge label="18+" className="bg-gray-800 border-none text-white" />
                    {details?.spoken_languages && details.spoken_languages.length > 0 && (
                      <Badge 
                        label={details.spoken_languages.length > 1 ? "MULTILINGUAL" : details.spoken_languages[0].name.toUpperCase()} 
                        className="bg-blue-500/20 border-blue-500/30 text-blue-400 px-3"
                      />
                    )}
                    <span className="p-1.5 bg-gray-800 rounded-sm text-[10px] text-gray-400 font-bold">CC</span>
                    <span className="p-1.5 bg-gray-800 rounded-sm text-[10px] text-gray-400 font-bold">AD)))</span>
                    <Badge label="4K UHD" className="bg-gray-800 border-none text-gray-400" />
                 </div>
               </>
             )}

             <button className="flex items-center gap-2 text-blue-400 font-bold text-sm group">
                <span className="group-hover:underline">Languages</span> <ChevronRight size={16} />
             </button>
          </div>

          {/* Cast & Crew Section */}
          {!loading && details?.credits && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h3 className="text-white font-black uppercase tracking-widest text-xs">Cast & Crew</h3>
                  {details.credits.crew?.find((c: any) => c.job === "Director") && (
                    <span className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      Dir. <span className="text-gray-300">{details.credits.crew.find((c: any) => c.job === "Director").name}</span>
                    </span>
                  )}
                </div>
                <button className="text-blue-400 text-[10px] font-black uppercase tracking-tighter hover:underline">
                  Full Details
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2">
                {details.credits.cast?.slice(0, 10).map((person: any) => (
                  <div 
                    key={person.id} 
                    className="flex-shrink-0 w-24 space-y-2 group cursor-pointer"
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="aspect-square rounded-full overflow-hidden border-2 border-white/5 group-hover:border-blue-400/50 transition-colors shadow-xl">
                      <img 
                        src={person.profile_path ? `https://image.tmdb.org/t/p/w185${person.profile_path}` : "https://via.placeholder.com/185x185?text=No+Photo"} 
                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        alt={person.name}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-white text-[10px] font-black leading-tight line-clamp-1">{person.name}</p>
                      <p className="text-gray-500 text-[9px] font-bold tracking-tighter line-clamp-1 uppercase">{person.character}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TV Seasons & Episodes Section */}
          {!loading && details?.seasons && details.seasons.length > 0 && (
            <div className="space-y-6 pt-6 border-t border-white/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h3 className="text-white font-black uppercase tracking-widest text-xs">Seasons & Episodes</h3>
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                  {details.seasons.filter((s: any) => s.season_number > 0).map((season: any) => (
                    <button
                      key={season.id}
                      onClick={() => setSelectedSeason(season.season_number)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all border",
                        selectedSeason === season.season_number 
                          ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      Season {season.season_number}
                    </button>
                  ))}
                </div>
              </div>

              {loadingSeason ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="animate-spin mr-2" size={16} /> Loading episodes...
                </div>
              ) : (
                <div className="space-y-4">
                  {seasonDetails?.episodes?.map((episode: any) => (
                    <motion.div
                      key={episode.id}
                      whileHover={{ x: 4 }}
                      onClick={() => onPlay({
                        ...movie,
                        title: `${movie.title || movie.name} - S${episode.season_number}E${episode.episode_number}: ${episode.name}`,
                        backdrop_path: episode.still_path || movie.backdrop_path,
                      })}
                      className="group flex flex-col md:flex-row gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all cursor-pointer shadow-xl"
                    >
                      <div className="relative w-full md:w-56 aspect-video rounded-xl overflow-hidden shrink-0">
                        <img 
                          src={episode.still_path ? `https://image.tmdb.org/t/p/w300${episode.still_path}` : `https://image.tmdb.org/t/p/w300${movie.backdrop_path}`} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={episode.name}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="p-3 bg-blue-500 rounded-full shadow-xl shadow-blue-500/40 text-white scale-75 group-hover:scale-100 transition-transform">
                            <Play size={20} fill="currentColor" />
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded text-[9px] font-black text-white uppercase">
                          {episode.runtime || "45"}m
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                           <span className="text-blue-400 text-xs font-black tracking-tighter shrink-0">E{episode.episode_number}</span>
                           <h4 className="text-white text-sm font-black truncate uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                             {episode.name}
                           </h4>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed line-clamp-2 mb-3 lg:line-clamp-3">
                          {episode.overview || "Episode overview is currently unavailable."}
                        </p>
                        <div className="flex items-center gap-4 mt-auto">
                           <div className="flex items-center gap-1.5">
                              <Star size={10} className="text-[#f5c518]" fill="currentColor" />
                              <span className="text-[10px] font-black text-white">{episode.vote_average?.toFixed(1) || "8.5"}</span>
                           </div>
                           <span className="text-gray-600 text-[10px] font-bold uppercase tracking-widest">
                             {new Date(episode.air_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                           </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Related Videos (Recommendations) Section */}
          {!loading && details?.recommendations?.results && details.recommendations.results.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">Related Videos</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {details.recommendations.results.slice(0, 6).map((rec: Movie) => (
                  <motion.div 
                    key={rec.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onMovieSelect?.(rec)}
                    className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer bg-[#1c2a35] border border-white/5 shadow-xl"
                  >
                    <img 
                      src={rec.backdrop_path ? `https://image.tmdb.org/t/p/w300${rec.backdrop_path}` : "https://via.placeholder.com/300x169?text=No+Image"} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={rec.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 left-2 flex gap-1">
                      <Badge label={rec.media_type === "tv" ? "SERIES" : "MOVIE"} className="bg-black/60 border-none text-[8px] px-1.5 py-0" />
                    </div>
                    <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-[10px] font-black leading-tight line-clamp-1">{rec.title || rec.name}</p>
                    </div>
                    {/* Play icon overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="p-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
                          <Play size={16} fill="currentColor" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {selectedPerson && (
          <PersonDetails 
            person={selectedPerson} 
            onClose={() => setSelectedPerson(null)} 
            onMovieSelect={(m) => onMovieSelect?.(m)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ActionButton({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: (e: React.MouseEvent) => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-2 text-gray-400 hover:text-white transition-colors group"
    >
      <div className="p-2 group-active:scale-95 transition-transform">
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={cn(
      "px-2 py-0.5 border border-white/20 rounded text-[10px] font-black tracking-tighter text-gray-300",
      className
    )}>
      {label}
    </span>
  );
}
