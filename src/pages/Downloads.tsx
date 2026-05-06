import { motion } from "motion/react";
import { useDownloads } from "../context/DownloadContext";
import { Play, Trash2, DownloadCloud, Clock, HardDrive, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import VideoPlayer from "../components/VideoPlayer";
import { Movie } from "../types";

export default function Downloads() {
  const { user } = useAuth();
  const { downloadedItems, removeItem } = useDownloads();
  const navigate = useNavigate();
  const [playingMovie, setPlayingMovie] = useState<Movie | null>(null);

  if (!user?.isPremium) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
          <DownloadCloud size={48} />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Premium Feature</h1>
          <p className="text-gray-400 text-sm max-w-xs mx-auto">
            Downloads for offline viewing are only available for Premium members.
          </p>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-500 px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-colors"
        >
          Explore Premium
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-32 px-6 overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <DownloadCloud size={24} className="text-blue-500" />
              <h1 className="text-4xl font-black uppercase tracking-tighter italic">Downloads</h1>
            </div>
            <p className="text-gray-500 font-bold text-sm">
              Your offline cinema. {downloadedItems.length} items available.
            </p>
          </div>
          
          <div className="flex gap-4">
             <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10">
                <HardDrive size={16} className="text-gray-500" />
                <span className="text-xs font-black text-gray-400">
                  {downloadedItems.length * 450} MB Used
                </span>
             </div>
          </div>
        </div>

        {downloadedItems.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-white/[0.02] rounded-3xl border border-white/5 border-dashed">
            <p className="text-gray-500 font-bold">No downloads yet. Find something great to watch offline!</p>
            <button 
              onClick={() => navigate('/')}
              className="text-blue-400 font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Browse Movies <ChevronRight size={14} className="inline" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadedItems.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-[#0f171e] rounded-2xl overflow-hidden border border-white/5 hover:border-blue-500/30 transition-all shadow-2xl"
              >
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={item.backdrop_path ? `https://image.tmdb.org/t/p/w500${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.title}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button 
                      onClick={() => setPlayingMovie(item)}
                      className="p-4 bg-blue-500 rounded-full shadow-xl shadow-blue-500/40 text-white transform hover:scale-110 active:scale-95 transition-all"
                    >
                      <Play size={24} fill="currentColor" />
                    </button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                     <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-white uppercase">
                       {item.size || "450 MB"}
                     </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-white font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                      {item.title || item.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                       <div className="flex items-center gap-1">
                         <Clock size={10} />
                         <span>{new Date(item.downloadDate).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setPlayingMovie(item)}
                      className="text-blue-400 text-[10px] font-black uppercase tracking-widest hover:underline"
                    >
                      Play Offline
                    </button>
                    <button 
                      onClick={() => removeItem(item.id.toString())}
                      className="text-gray-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Storage Info */}
        <div className="bg-blue-500/5 border border-blue-500/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-white font-black uppercase tracking-tight">Smart Downloads</h4>
              <p className="text-gray-500 text-xs max-w-sm">
                We'll automatically download the next episode for you and delete the ones you've watched to save space.
              </p>
           </div>
           <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-500">Feature Active</span>
              <div className="w-12 h-6 bg-blue-500 rounded-full relative">
                 <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
           </div>
        </div>
      </div>

      <VideoPlayer movie={playingMovie!} onClose={() => setPlayingMovie(null)} />
    </div>
  );
}
