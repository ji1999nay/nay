const express = require('express');
const fetch = require('node-fetch');
const LRU = require('lru-cache');
const cors = require('cors');

const app = express();
app.use(cors());

const tokens = [
  'Bearer YOUR_TOKEN_1',
  'Bearer YOUR_TOKEN_2',
  'Bearer YOUR_TOKEN_3'
];
let tokenIndex = 0;
function getNextToken() {
  const token = tokens[tokenIndex];
  tokenIndex = (tokenIndex + 1) % tokens.length;
  return token;
}

const cache = new LRU({ max: 500, ttl: 1000 * 5 });

app.get('/search', async (req, res) => {
  const keyword = req.query.q;
  if (!keyword) {
    return res.status(400).json({ error: 'Missing keyword' });
  }

  if (cache.has(keyword)) {
    return res.json({ fromCache: true, data: cache.get(keyword) });
  }

  try {
    const token = getNextToken();
    const response = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(keyword)}&limit=3`,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    cache.set(keyword, data);
    res.json({ fromCache: false, data });
  } catch (error) {
    res.status(500).json({ error: 'Proxy Error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});