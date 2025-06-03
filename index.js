const express = require('express');
const scrapeLeaderboard = require('./scraper');

const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Loud Puppeteer Server is running.'));

app.get('/top25', async (req, res) => {
  try {
    const data = await scrapeLeaderboard();
    res.json(data);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Could not fetch leaderboard data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
