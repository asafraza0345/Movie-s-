import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Search from "./pages/Search";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600/30 selection:text-red-500 pb-24 md:pb-0">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/search" element={<Search />} />
            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Routes>
          <BottomNav />
        </div>
      </Router>
    </AuthProvider>
  );
}
