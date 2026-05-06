export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: "movie" | "tv";
  genre_ids?: number[];
  trailer_key?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isPremium: boolean;
  watchlist: string[];
  createdAt: string;
}

export interface AppState {
  user: UserProfile | null;
  loading: boolean;
  watchlist: Movie[];
}
