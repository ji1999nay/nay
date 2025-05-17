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
    const response = await fetch("https://api.mercari.jp/v2/entities:search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: keyword,
        indexRouting: "INDEX_ROUTING_SEARCH",
        serviceFrom: "suruga",
        itemStatuses: ["on_sale"],
        sort: "created_time:desc",
        size: limit
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
  console.log("Mercari Proxy running on port " + PORT);
});