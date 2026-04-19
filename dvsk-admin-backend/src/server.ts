import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { exec } from 'child_process'; // ✅ Added this import for terminal commands
import path from 'path'; // ✅ Added this import for folder paths

import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import chatRoutes from './routes/chat.js';

dotenv.config();

const app = express();

// ✅ CORS handles preflight automatically when passed to app.use
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));

// We parse JSON bodies
app.use(express.json());

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/chat', chatRoutes);

// ✅ NEW: Route to start your public storefront
app.post('/api/start-store', (req, res) => {
  // ⚠️ IMPORTANT: Change this to the exact folder path of your public clothing brand website!
  // Example Windows: 'C:/Users/Kashyap/Documents/my-clothing-site'
  // Example Mac: '/Users/Kashyap/Documents/my-clothing-site'
  const dvskPath = path.resolve(__dirname, '../../dvsk');

  console.log(`🚀 Attempting to start DVSK public storefront at: ${dvskPath}`);

  // This runs 'npm run dev' inside that folder
  exec('npm run dev', { cwd: dvskPath }, (error, stdout, stderr) => {
    if (error) {
      console.error(`Execution error: ${error.message}`);
      return;
    }
    console.log(`Storefront Output: ${stdout}`);
  });

  // We send a success response immediately so the frontend "Go Live" button stops spinning
  res.json({ success: true, message: 'Public store server is booting up...' });
});


// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'DVSK Admin API Running ✅' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Admin Backend running on http://localhost:${PORT}`);
});