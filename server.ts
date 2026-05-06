import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  const TMDB_BASE_URL = "https://api.themoviedb.org/3";

  // TMDB API Proxy Routes
  app.get("/api/movies/trending", async (req, res) => {
    try {
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        console.error("TMDB_API_KEY is missing in environment variables.");
        return res.status(500).json({ error: "TMDB API Key is missing. Please add TMDB_API_KEY to your Secrets." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/trending/movie/day`, {
        params: { api_key: TMDB_API_KEY }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Trending Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ 
        error: error.message,
        details: error.response?.data || "No additional details"
      });
    }
  });

  app.get("/api/movies/popular", async (req, res) => {
    try {
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing. Please add TMDB_API_KEY to your Secrets." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: { api_key: TMDB_API_KEY }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Popular Error:", error.response?.data || error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/movies/search", async (req, res) => {
    try {
      const { q } = req.query;
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      // Using search/multi to get movies, tv shows, and people worldwide
      const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, {
        params: { 
          api_key: TMDB_API_KEY, 
          query: q,
          include_adult: false,
          language: "en-US",
          page: 1
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Search Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/movies/details/:type/:id", async (req, res) => {
    try {
      const { type, id } = req.params;
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/${type}/${id}`, {
        params: { api_key: TMDB_API_KEY, append_to_response: "videos,images,credits,recommendations,external_ids" }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Details Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/people/credits/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/person/${id}/combined_credits`, {
        params: { api_key: TMDB_API_KEY }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Person Credits Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/tv/:id/season/:season_number", async (req, res) => {
    try {
      const { id, season_number } = req.params;
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/tv/${id}/season/${season_number}`, {
        params: { api_key: TMDB_API_KEY }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB TV Season Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/movies/top-rated", async (req, res) => {
    try {
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
        params: { api_key: TMDB_API_KEY, page: 1 }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Top Rated Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  app.get("/api/movies/indian/:language", async (req, res) => {
    try {
      const { language } = req.params; // 'hi' for Bollywood, 'te' for Tollywood
      if (!TMDB_API_KEY || TMDB_API_KEY === "") {
        return res.status(500).json({ error: "TMDB API Key is missing." });
      }
      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params: { 
          api_key: TMDB_API_KEY, 
          with_original_language: language,
          sort_by: "popularity.desc",
          page: 1
        }
      });
      res.json(response.data);
    } catch (error: any) {
      console.error("TMDB Indian Cinema Error:", error.message);
      res.status(error.response?.status || 500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
