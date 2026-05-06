import { Home, Download, Search, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { icon: <Home size={24} />, label: "Home", path: "/" },
    { 
      icon: (
        <div className="flex flex-col items-center">
          <span className="text-blue-400 font-extrabold italic text-sm leading-none">cinemax</span>
          <div className="w-8 h-0.5 bg-blue-400 rounded-full mt-[-1px] blur-[0.5px]" />
        </div>
      ), 
      label: "Store", 
      path: "/" 
    },
    { 
      icon: (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden border border-white/20">
          <User size={20} className="text-white fill-current translate-y-1" />
        </div>
      ), 
      label: "Watchlist", 
      path: "/watchlist" 
    },
    { icon: <Download size={24} />, label: "Downloads", path: "/downloads" },
    { icon: <Search size={24} />, label: "Search", path: "/search" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-[#000000]/95 backdrop-blur-2xl border-t border-white/5 pt-3 pb-6">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={idx}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-white" : "text-gray-500"
              )}
            >
              <div className={cn(
                "transition-transform active:scale-90",
                isActive && idx !== 2 && "scale-110" // Profile icon doesn't need scale up as it's already bigger
              )}>
                {item.icon}
              </div>
              <span className="text-[9px] font-bold uppercase tracking-tighter opacity-80">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
