import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import { Movie } from "../types";
import { motion } from "motion/react";
import { Play, Info, Plus } from "lucide-react";
import { cn } from "../lib/utils";

interface HeroCarouselProps {
  movies: Movie[];
  onPlay: (movie: Movie) => void;
}

export default function HeroCarousel({ movies, onPlay }: HeroCarouselProps) {
  return (
    <div className="relative w-full h-[85vh] lg:h-screen overflow-hidden bg-black">
      <Swiper
        effect={"coverflow"}
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={"auto"}
        coverflowEffect={{
          rotate: 30,
          stretch: 0,
          depth: 200,
          modifier: 1,
          slideShadows: true,
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{ clickable: true }}
        modules={[EffectCoverflow, Autoplay, Pagination]}
        className="w-full h-full py-20"
      >
        {movies.slice(0, 10).map((movie) => (
          <SwiperSlide key={movie.id} className="w-[85%] lg:w-[60%] h-[70vh] lg:h-[80vh] rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500">
            <div className="relative w-full h-full group">
              {/* Background Backdrop */}
              <div className="absolute inset-0">
                <img 
                  src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 p-8 lg:p-16 w-full lg:w-2/3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-4xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl mb-4 tracking-tighter">
                    {movie.title || movie.name}
                  </h1>
                  <p className="text-gray-300 text-sm lg:text-lg line-clamp-3 mb-8 max-w-2xl font-light leading-relaxed">
                    {movie.overview}
                  </p>

                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => onPlay(movie)}
                      className="flex items-center gap-2 bg-white text-black px-8 py-3 rounded font-bold hover:bg-gray-200 transition-all shadow-xl"
                    >
                      <Play size={20} fill="currentColor" /> Play Now
                    </button>
                    <button className="flex items-center gap-2 bg-gray-500/30 backdrop-blur-md text-white px-8 py-3 rounded font-bold hover:bg-gray-500/50 transition-all">
                      <Plus size={20} /> My List
                    </button>
                    <button className="flex items-center gap-2 bg-transparent text-white px-2 py-3 rounded-full hover:bg-white/10 transition-all">
                      <Info size={24} />
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* Rating Badge */}
              <div className="absolute top-8 right-8 bg-yellow-500/20 backdrop-blur-md border border-yellow-500/50 text-yellow-500 px-3 py-1 rounded-full text-sm font-bold shadow-2xl">
                ★ {movie.vote_average.toFixed(1)}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />
    </div>
  );
}
