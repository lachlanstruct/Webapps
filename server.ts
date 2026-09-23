import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Health check endpoint for Cloud Run and container orchestrators
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// Serve compiled static assets from dist directory
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running and listening on http://0.0.0.0:${port}`);
});
