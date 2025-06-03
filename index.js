import express from 'express';
import scrapeTop25 from './scraper.js';

const app = express();
const PORT = process.env.PORT || 3000;

let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/top25', async (req, res) => {
  const now = Date.now();

  if (cachedData && (now - lastFetched) < CACHE_DURATION) {
    return res.json(cachedData);
  }

  try {
    const data = await scrapeTop25();
    cachedData = data;
    lastFetched = now;
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
