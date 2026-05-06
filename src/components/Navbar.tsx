import { Link, useNavigate } from "react-router-dom";
import { Search, Bell, User, Star, LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function Navbar() {
  const { user, signInWithGoogle, logout } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300",
        isScrolled ? "bg-black/90 backdrop-blur-md shadow-2xl" : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center gap-8">
        <Link to="/" className="text-3xl font-black italic tracking-tighter text-red-600">
          CINEMAX
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/movies" className="hover:text-white transition-colors">Movies</Link>
          <Link to="/series" className="hover:text-white transition-colors">Series</Link>
          <Link to="/trending" className="hover:text-white transition-colors">New & Popular</Link>
          <Link to="/watchlist" className="hover:text-white transition-colors">My List</Link>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <AnimatePresence>
            {showSearch && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="absolute right-0 flex items-center"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Titles, people, genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/60 border border-white/20 px-4 py-2 pr-10 rounded-full text-sm outline-none focus:border-red-600 transition-all backdrop-blur-md"
                />
                <button 
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute right-3 text-gray-400 hover:text-white"
                >
                  <X size={16} />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          
          {!showSearch && (
            <button 
              onClick={() => setShowSearch(true)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <Search size={22} />
            </button>
          )}
        </div>

        <button className="text-gray-300 hover:text-white transition-colors">
          <Bell size={22} />
        </button>

        {user ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group"
            >
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                alt="Avatar" 
                className="w-8 h-8 rounded-md border border-gray-700 group-hover:border-white transition-all"
              />
              {user.isPremium && <Star className="text-yellow-400 fill-yellow-400" size={12} />}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-56 bg-black/95 border border-gray-800 rounded-lg overflow-hidden shadow-2xl backdrop-blur-xl"
                >
                  <div className="p-4 border-b border-gray-800">
                    <p className="text-sm font-semibold">{user.displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    {user.isPremium ? (
                      <span className="mt-2 inline-block px-2 py-0.5 bg-yellow-600/20 text-yellow-500 text-[10px] font-bold uppercase rounded border border-yellow-600/30">
                        Premium Member
                      </span>
                    ) : (
                      <button className="mt-2 w-full text-left text-[10px] font-bold uppercase text-red-500 hover:text-red-400 transition-colors">
                        Upgrade to Premium
                      </button>
                    )}
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors">Settings</button>
                    <button className="w-full text-left px-4 py-2 text-xs hover:bg-white/10 transition-colors">Help Center</button>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 transition-all font-medium"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button 
            onClick={signInWithGoogle}
            className="px-5 py-1.5 bg-red-600 font-bold hover:bg-red-700 transition-all rounded text-sm tracking-wide"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
