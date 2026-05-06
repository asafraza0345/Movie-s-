import { useEffect, useState } from "react";
import { api } from "../services/api";
import { Movie } from "../types";
import HeroCarousel from "../components/HeroCarousel";
import MovieRow from "../components/MovieRow";
import TopTenRow from "../components/TopTenRow";
import AdBanner from "../components/AdBanner";
import MovieDetails from "../components/MovieDetails";
import VideoPlayer from "../components/VideoPlayer";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles, Zap, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [bollywood, setBollywood] = useState<Movie[]>([]);
  const [tollywood, setTollywood] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPremiumPopup, setShowPremiumPopup] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const { user, togglePremium } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendData, popData, topData, hindiData, teluguData] = await Promise.all([
          api.getTrending(),
          api.getPopular(),
          api.getTopRated(),
          api.getIndianCinema("hi"),
          api.getIndianCinema("te")
        ]);
        setTrending(trendData);
        setPopular(popData);
        setTopRated(topData.results || []);
        setBollywood(hindiData.results || []);
        setTollywood(teluguData.results || []);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.error || "Unable to fetch movies. Please check if TMDB_API_KEY is set in Secrets.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Show premium popup after 5 seconds if not premium
    const timer = setTimeout(() => {
      if (user && !user.isPremium) {
        setShowPremiumPopup(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-black">
      <motion.div 
        animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full"
      />
    </div>
  );

  if (error) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-6 text-center">
      <div className="w-20 h-20 bg-red-600/10 rounded-3xl flex items-center justify-center mb-6 border border-red-600/20">
        <X className="text-red-600" size={40} />
      </div>
      <h1 className="text-3xl font-black mb-4">Configuration Error</h1>
      <p className="text-gray-400 max-w-md mb-8 leading-relaxed">
        {error}
      </p>
      <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-gray-500 max-w-lg">
        Go to <span className="text-white">Settings &gt; Secrets</span> and add <span className="text-red-500">TMDB_API_KEY</span> with your API key from themoviedb.org
      </div>
    </div>
  );

  return (
    <main className="bg-black min-h-screen pb-20">
      <HeroCarousel movies={trending} onPlay={setSelectedMovie} />
      
      <div className="relative -mt-40 z-20 space-y-12 pb-20">
        <MovieRow title="🔥 Best New Releases" movies={trending.slice(0, 8)} onPlay={setSelectedMovie} />
        
        <MovieRow title="Trending Now" movies={trending} onPlay={setSelectedMovie} />
        
        {topRated.length > 0 && <TopTenRow movies={topRated} onPlay={setSelectedMovie} />}

        {!user?.isPremium && <AdBanner />}
        
        <MovieRow title="Popular Series" movies={popular} onPlay={setSelectedMovie} />
        
        {bollywood.length > 0 && (
          <MovieRow title="Best of Bollywood" movies={bollywood} onPlay={setSelectedMovie} />
        )}

        <MovieRow title="Action Blockbusters" movies={trending.slice().reverse()} onPlay={setSelectedMovie} />
        
        {tollywood.length > 0 && (
          <MovieRow title="Tollywood Cinema" movies={tollywood} onPlay={setSelectedMovie} />
        )}

        {!user?.isPremium && <AdBanner />}
        <MovieRow title="New Releases" movies={popular.slice().reverse()} onPlay={setSelectedMovie} />
        
        <MovieRow title="Award Winning" movies={topRated.slice(10)} onPlay={setSelectedMovie} />
        <MovieRow title="Binge Worthy TV" movies={popular.slice(5)} onPlay={setSelectedMovie} />
        <MovieRow title="Explosive Thrillers" movies={trending.slice(10).reverse()} onPlay={setSelectedMovie} />
        <MovieRow title="Critical Acclaim" movies={popular.slice().sort(() => Math.random() - 0.5)} onPlay={setSelectedMovie} />
        <MovieRow title="Family Favorites" movies={trending.filter(m => m.vote_average > 7)} onPlay={setSelectedMovie} />
        <MovieRow title="Hidden Gems" movies={topRated.slice(15)} onPlay={setSelectedMovie} />
        <MovieRow title="Nostalgic Classics" movies={popular.filter(m => new Date(m.release_date || "").getFullYear() < 2010)} onPlay={setSelectedMovie} />
        <MovieRow title="World Cinema" movies={trending.filter(m => m.original_language !== 'en')} onPlay={setSelectedMovie} />
        <MovieRow title="Must Watch This Weekend" movies={popular.slice(12)} onPlay={setSelectedMovie} />
        <MovieRow title="Sci-Fi & Fantasy" movies={trending.slice(1, 10)} onPlay={setSelectedMovie} />
        <MovieRow title="Crime Dramas" movies={popular.slice(8, 16)} onPlay={setSelectedMovie} />
        <MovieRow title="Heartfelt Romances" movies={topRated.slice(8, 15)} onPlay={setSelectedMovie} />
        <MovieRow title="Terrifying Horror" movies={trending.slice(4, 12)} onPlay={setSelectedMovie} />
        <MovieRow title="Documentary Focus" movies={popular.slice(0, 8)} onPlay={setSelectedMovie} />
        <MovieRow title="Animation Station" movies={topRated.slice(0, 6)} onPlay={setSelectedMovie} />
        <MovieRow title="Independent Spirit" movies={trending.slice(15, 20)} onPlay={setSelectedMovie} />
        <MovieRow title="Sports & Underdogs" movies={popular.slice(10, 18)} onPlay={setSelectedMovie} />
        <MovieRow title="Period Pieces" movies={topRated.slice(5, 12)} onPlay={setSelectedMovie} />
        <MovieRow title="Short & Sweet" movies={trending.slice(3, 8)} onPlay={setSelectedMovie} />
        <MovieRow title="Future Tech" movies={popular.slice(2, 10)} onPlay={setSelectedMovie} />
        <MovieRow title="Epic Journeys" movies={trending.slice(0, 15)} onPlay={setSelectedMovie} />
        <MovieRow title="Dark & Gritty" movies={popular.slice(5, 12).reverse()} onPlay={setSelectedMovie} />
        <MovieRow title="Wholesome Vibes" movies={topRated.slice(12, 18)} onPlay={setSelectedMovie} />
        <MovieRow title="Supernatural Tales" movies={trending.slice(8, 14)} onPlay={setSelectedMovie} />
        <MovieRow title="Mind-Bending Plots" movies={popular.slice(15, 20)} onPlay={setSelectedMovie} />
        <MovieRow title="Coming of Age" movies={topRated.slice(1, 8)} onPlay={setSelectedMovie} />
        <MovieRow title="Historical Epics" movies={trending.slice().sort(() => Math.random() - 0.5)} onPlay={setSelectedMovie} />
        <MovieRow title="Cult Classics" movies={popular.slice(10, 15)} onPlay={setSelectedMovie} />
        <MovieRow title="Sizzling Summer Hits" movies={trending.slice(2, 7)} onPlay={setSelectedMovie} />
        <MovieRow title="Edge of Your Seat" movies={popular.slice().reverse()} onPlay={setSelectedMovie} />
        <MovieRow title="Cinematic Masterpieces" movies={topRated.slice(0, 10)} onPlay={setSelectedMovie} />
        <MovieRow title="Global Stories" movies={trending.filter(m => m.original_language !== 'en').reverse()} onPlay={setSelectedMovie} />
        <MovieRow title="Late Night Bites" movies={popular.slice(3, 9)} onPlay={setSelectedMovie} />
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

      {/* Premium Popup */}
      <AnimatePresence>
        {showPremiumPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPremiumPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              className="relative w-full max-w-lg bg-gradient-to-br from-gray-900 to-black p-8 rounded-3xl border border-white/10 shadow-3xl overflow-hidden"
            >
               {/* Decorative background stuff */}
               <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 blur-[100px]" />
               <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-600/20 blur-[100px]" />

               <button 
                onClick={() => setShowPremiumPopup(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
               >
                 <X size={24} />
               </button>

               <div className="text-center space-y-6">
                 <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-yellow-600 to-yellow-300 rounded-2xl rotate-12 shadow-2xl mb-4">
                    <Sparkles className="text-black" size={40} fill="currentColor" />
                 </div>
                 
                 <h2 className="text-4xl font-black text-white tracking-tighter">
                   GO PREMIUM
                 </h2>
                 
                 <p className="text-gray-400 text-lg leading-relaxed">
                   Experience movies in <span className="text-white font-bold">4K Ultra HD</span>, download for offline viewing, and enjoy an <span className="text-white font-bold">Ad-free</span> experience.
                 </p>

                 <div className="grid grid-cols-1 gap-4 pt-4">
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                       <Zap className="text-blue-400" size={20} />
                       <span className="text-sm font-medium">Faster Streaming & No Buffering</span>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 p-4 rounded-xl border border-white/10">
                       <Lock className="text-purple-400" size={20} />
                       <span className="text-sm font-medium">Exclusive Early Access to New Releases</span>
                    </div>
                 </div>

                 <button 
                  onClick={() => {
                    togglePremium();
                    setShowPremiumPopup(false);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-xl shadow-2xl transform transition hover:scale-105 active:scale-95 uppercase tracking-widest mt-4"
                 >
                    Upgrade Now - $9.99/mo
                 </button>
                 
                 <p className="text-[10px] text-gray-500 uppercase tracking-tighter">
                   No commitment. Cancel anytime. Ad-supported free tier still available.
                 </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
