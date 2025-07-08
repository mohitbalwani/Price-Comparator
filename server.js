const express = require('express');
const cors = require('cors');
const path = require('path');
const searchHandler = require('./api/search');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API routes
app.post('/api/search', searchHandler);
app.post('/search', searchHandler); // Backward compatibility

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});