import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import searchHandler from './api/search.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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