import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url'; // ✅ NEW: Required to fix __dirname in ES Modules

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

// ✅ NEW: This creates the __dirname variable for modern ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ✅ 1. Bulletproof Vercel CORS Headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Respond immediately to OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// ✅ 2. Standard CORS package fallback
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));

// ✅ ADD THIS ONE LINE RIGHT HERE — handles OPTIONS preflight on ALL routes
app.options('*', cors());

app.use(express.json());
// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// Route to start your public storefront
app.post('/api/start-store', (req, res) => {
  try {
    const dvskPath = path.resolve(__dirname, '../../dvsk');
    console.log(`🚀 Attempting to start DVSK public storefront at: ${dvskPath}`);

    // NOTE: This exec command works locally, but will be ignored on Vercel 
    // because Vercel does not allow background terminal processes.
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

// ✅ NEW: Vercel handles the server listening automatically. 
// We only use app.listen if we are running this locally on your computer!
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Admin Backend running on http://localhost:${PORT}`);
  });
}

// ✅ REQUIRED for Vercel
export default app;