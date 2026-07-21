/**
 * Rock Merch & Roll — Backend API Server
 *
 * Express + TypeScript + SQLite (sql.js)
 * Listens on port 4000 by default.
 *
 * Endpoints (matching the API contract):
 *   GET  /products       → Product[]
 *   GET  /products/:id   → Product
 *   POST /users          → User
 *   GET  /orders?userId= → Order[]
 *   POST /orders         → Order
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './db.js';
import productsRouter from './routes/products.js';
import usersRouter from './routes/users.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import contactRouter from './routes/contact.js';

const PORT = parseInt(process.env.PORT ?? '4000', 10);
const app = express();

// ── Middleware ──────────────────────────────────

// CORS: allow the React frontend (localhost:3000) and any dev origin
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// ── Routes ─────────────────────────────────────

app.use('/api/auth', authRouter);
app.use('/products', productsRouter);
app.use('/users', usersRouter);
app.use('/orders', ordersRouter);
app.use('/api/contact', contactRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Start ───────────────────────────────────────

async function start() {
  try {
    await initDb();
    console.log('[server] Database initialized successfully.');
  } catch (err) {
    console.error('[server] Failed to initialize database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[server] Rock Merch & Roll API running on http://localhost:${PORT}`);
    console.log(`[server] Endpoints:`);
    console.log(`  POST http://localhost:${PORT}/api/auth/register`);
    console.log(`  POST http://localhost:${PORT}/api/auth/login`);
    console.log(`  GET  http://localhost:${PORT}/products`);
    console.log(`  GET  http://localhost:${PORT}/products/:id`);
    console.log(`  POST http://localhost:${PORT}/users`);
    console.log(`  GET  http://localhost:${PORT}/users/:id`);
    console.log(`  PATCH http://localhost:${PORT}/users/:id`);
    console.log(`  GET  http://localhost:${PORT}/orders?userId=:id`);
    console.log(`  POST http://localhost:${PORT}/orders`);
    console.log(`  POST http://localhost:${PORT}/api/contact`);
    console.log(`  GET  http://localhost:${PORT}/health`);
  });
}

start();
