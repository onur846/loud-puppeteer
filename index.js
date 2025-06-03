import express from 'express';
import { scrapeTop25 } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 3000;

let cachedData = null;
let lastFetched = 0;

app.get('/top25', (req, res) => {
  if (cachedData) {
    return res.json(cachedData);
  } else {
    return res.status(503).json({ error: 'Data not yet available' });
  }
});

app.get('/refresh', async (req, res) => {
  try {
    console.log('[REFRESH] Scraping fresh data...');
    const freshData = await scrapeTop25();
    cachedData = freshData;
    lastFetched = Date.now();
    res.json({ message: 'Data refreshed', updatedAt: lastFetched });
  } catch (err) {
    console.error('[REFRESH ERROR]', err);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

app.get('/', (req, res) => {
  res.send('🟢 Loud Puppeteer running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
