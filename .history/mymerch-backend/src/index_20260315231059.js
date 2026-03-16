import express    from 'express';
import cors       from 'cors';
import dotenv     from 'dotenv';
import path       from 'path';
import { fileURLToPath } from 'url';

import { initDB }      from './config/db.js';
import userRoutes      from './routes/userRoutes.js';
import productRoutes   from './routes/productRoutes.js';
import orderRoutes     from './routes/orderRoutes.js';
import reviewRoutes    from './routes/reviewRoutes.js';
import wishlistRoutes  from './routes/wishlistRoutes.js';

dotenv.config();

console.log('DB_PASSWORD:', JSON.stringify(process.env.DB_PASSWORD));
console.log('DB_USER:', JSON.stringify(process.env.DB_USER));
console.log('DB_HOST:', JSON.stringify(process.env.DB_HOST));

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// ── Middleware ──────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
// e.g. http://localhost:4000/src/uploads/filename.jpg
app.use('/src/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────
app.use('/api/user',     userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// ── Start ───────────────────────────────────────────────────
const start = async () => {
  await initDB();
  app.listen(PORT, () => {
    console.log(`🚀  MyMerch backend running on http://localhost:${PORT}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
