import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import reviewRoutes from './routes/review.js';
import questRoutes from './routes/quest.js';
import shopRoutes from './routes/shop.js';
import gameRoutes from './routes/game.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/review', reviewRoutes);
app.use('/api/quest', questRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/game', gameRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
