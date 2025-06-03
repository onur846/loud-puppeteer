import express from 'express';
import scrapeTop25 from './scraper.js';

const app = express();
const PORT = process.env.PORT || 3000;

let cachedData = null;
let lastFetched = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/top25', async (req, res) => {
  const now = Date.now();

  if (cachedData && (now - lastFetched < CACHE_DURATION)) {
    console.log('[CACHE] Serving cached leaderboard');
    return res.json(cachedData);
  }

  try {
    console.log('[SCRAPER] Fetching fresh leaderboard...');
    const freshData = await scrapeTop25();
    cachedData = freshData;
    lastFetched = now;
    res.json(freshData);
  } catch (error) {
    console.error('[SCRAPER ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.get('/', (req, res) => {
  res.send('🟢 Loud Puppeteer is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
