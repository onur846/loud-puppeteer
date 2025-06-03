import express from 'express';
import { scrapeTop25Users } from './scraper.js';

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Loud Puppeteer Server is running.');
});

app.get('/top25', async (req, res) => {
  try {
    const users = await scrapeTop25Users();
    res.json(users);
  } catch (err) {
    console.error('Scraper failed:', err);
    res.status(500).json({ error: 'Could not fetch leaderboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
