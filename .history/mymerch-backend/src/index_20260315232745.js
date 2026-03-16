import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDB }     from './config/db.js';
import userRoutes     from './routes/userRoutes.js';
import productRoutes  from './routes/productRoutes.js';
import orderRoutes    from './routes/orderRoutes.js';
import reviewRoutes   from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/src/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/user',     userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/reviews',  reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

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