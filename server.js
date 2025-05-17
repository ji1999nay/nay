const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/search', async (req, res) => {
  const keyword = req.query.q;
  const limit = parseInt(req.query.limit || "3");

  if (!keyword) {
    return res.status(400).json({ error: "Missing keyword" });
  }

  try {
    const response = await fetch("https://api.mercari.jp/search_web/v2/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mercari-Web",
        "X-Platform": "web"
      },
      body: JSON.stringify({
        keyword: keyword,
        sort: "created_time",
        order: "desc",
        pageSize: limit
      }),
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Fetch failed", details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Updated Mercari Proxy running on port " + PORT);
});