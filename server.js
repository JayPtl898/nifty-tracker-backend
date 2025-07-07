import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

let cachedCookies = '';

app.get('/nifty', async (req, res) => {
  try {
    // Step 1: Fetch cookies from NSE home page
    const cookieResponse = await axios.get('https://www.nseindia.com', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    cachedCookies = cookieResponse.headers['set-cookie']
      .map(cookie => cookie.split(';')[0])
      .join('; ');

    // Step 2: Use cookies to fetch option chain
    const response = await axios.get(
      'https://www.nseindia.com/api/option-chain-indices?symbol=NIFTY',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://www.nseindia.com',
          'Cookie': cachedCookies,
        },
      }
    );

    const data = response.data.records.data;
    res.json(data);
  } catch (error) {
    console.error('NSE fetch failed:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from NSE' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
