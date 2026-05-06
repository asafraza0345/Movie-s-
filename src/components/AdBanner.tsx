import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { Info, ExternalLink } from "lucide-react";

export default function AdBanner() {
  const { user } = useAuth();

  if (user?.isPremium) return null;

  return (
    <div className="px-6 md:px-12 py-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="w-full h-24 md:h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-white/5 flex items-center justify-between px-8 relative overflow-hidden"
      >
        {/* AdMob Label */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-[8px] font-bold text-gray-500 uppercase tracking-widest bg-black/40 px-1.5 py-0.5 rounded">
          <Info size={8} /> AdMob Sponsored
        </div>

        <div className="flex items-center gap-6 z-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-red-600/10 rounded-lg flex items-center justify-center border border-red-600/20">
             <img 
               src="https://api.dicebear.com/7.x/initials/svg?seed=Ad&backgroundColor=b91c1c" 
               className="w-8 h-8 rounded"
               alt="Ad"
             />
          </div>
          <div>
            <h4 className="text-sm md:text-lg font-bold text-white tracking-tight">Stream Cinema-Quality Movies</h4>
            <p className="text-xs text-gray-400 max-w-md hidden md:block">Get the best deals on 4K projectors and sound systems. Upgrade your home theater today.</p>
          </div>
        </div>

        <button className="z-10 group flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-bold px-6 py-2 md:py-3 rounded-full transition-all shadow-xl">
          Learn More <ExternalLink size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>

        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 blur-3xl rounded-full" />
      </motion.div>
    </div>
  );
}
