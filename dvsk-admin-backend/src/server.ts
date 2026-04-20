import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ Single, clean CORS setup
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.options('*', cors());

app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// Route to start your public storefront (local only)
app.post('/api/start-store', (req, res) => {
  try {
    const dvskPath = path.resolve(__dirname, '../../dvsk');
    console.log(`🚀 Attempting to start DVSK public storefront at: ${dvskPath}`);

    if (process.env.NODE_ENV !== 'production') {
      exec('npm run dev', { cwd: dvskPath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`Execution error: ${error.message}`);
          return;
        }
        console.log(`Storefront Output: ${stdout}`);
      });
    }

    res.json({ success: true, message: 'Public store server is booting up...' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'DVSK Admin API Running ✅' });
});

const PORT = process.env.PORT || 5001;

// Only listen locally — Vercel handles this automatically in production
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Admin Backend running on http://localhost:${PORT}`);
  });
}

// Required for Vercel serverless
export default app;