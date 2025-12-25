require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fetch = require("node-fetch");

const app = express();

// ------------------- MIDDLEWARE -------------------
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ------------------- PORT -------------------
const PORT = process.env.PORT || 4000;
const UNSPLASH_KEY = process.env.UNSPLASH_KEY;

console.log("🔑 API Key loaded:", UNSPLASH_KEY ? "YES ✅" : "NO ❌");

// ------------------- ROUTES -------------------

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// API endpoint
app.get("/api/images", async (req, res) => {
  const query = req.query.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter required" });
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
      query
    )}&per_page=24`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_KEY}`,
      },
    });

    const data = await response.json();

    const images = data.results.map((photo) => ({
      id: photo.id,
      thumb: photo.urls.small,
      full: photo.urls.regular,
      alt: photo.alt_description || "Image",
    }));

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ------------------- START SERVER -------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
