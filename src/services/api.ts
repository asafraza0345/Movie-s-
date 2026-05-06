import axios from "axios";
import { Movie } from "../types";

export const api = {
  getTrending: async (): Promise<Movie[]> => {
    const { data } = await axios.get("/api/movies/trending");
    return data.results;
  },
  getPopular: async (): Promise<Movie[]> => {
    const { data } = await axios.get("/api/movies/popular");
    return data.results;
  },
  search: async (q: string): Promise<Movie[]> => {
    const { data } = await axios.get("/api/movies/search", { params: { q } });
    return data.results;
  },
  getDetails: async (type: string, id: string): Promise<any> => {
    const { data } = await axios.get(`/api/movies/details/${type}/${id}`);
    return data;
  },
  getTopRated: async (): Promise<any> => {
    const { data } = await axios.get("/api/movies/top-rated");
    return data;
  },
  getIndianCinema: async (lang: "hi" | "te"): Promise<any> => {
    const { data } = await axios.get(`/api/movies/indian/${lang}`);
    return data;
  },
  getPersonCredits: async (id: string): Promise<any> => {
    const { data } = await axios.get(`/api/people/credits/${id}`);
    return data;
  },
  getTvSeason: async (id: string, seasonNumber: number): Promise<any> => {
    const { data } = await axios.get(`/api/tv/${id}/season/${seasonNumber}`);
    return data;
  }
};
