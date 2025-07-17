import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { courseRoutes } from './src/modules/courses/routes';
import { lessonRoutes } from './src/modules/lessons/routes';
import { userRoutes } from './src/modules/users/routes';
import { enrollmentRoutes } from './src/modules/enrollments/routes';
import { searchRoutes } from './src/modules/search/routes';
import { authRoutes } from './src/modules/auth/routes';
import { chatRoutes } from './src/modules/chat/routes';
import { aiRoutes } from './src/modules/ai/routes';

const app = express();
const PORT = process.env.PORT || 3001;


// Middleware
app.use(
  cors({
    origin: [
      'http://localhost:4173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
  })
);

app.use(express.json());
// Root route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({ message: 'Sentry Academy API', version: '1.0.0' });
});

// Handle favicon requests gracefully
app.get('/favicon.ico', (req: express.Request, res: express.Response) => {
  res.status(204).end();
});

// API routes
console.log('🔧 Setting up API routes...');
app.use('/api', courseRoutes);
app.use('/api', lessonRoutes);
app.use('/api', userRoutes);
app.use('/api', enrollmentRoutes);
app.use('/api', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', chatRoutes);
app.use('/api', aiRoutes);

// Error handling middleware
// @ts-expect-error - implicit any
app.use((err, req, res, _) => {
  const errorMsg = `💥 Error for ${req.method} ${req.url}: ${err}`;
  console.error(errorMsg);
  process.stderr.write(errorMsg + '\n');

  res.status(500).json({
    error: true,
    message: err instanceof Error ? err.message : 'Internal server error',
    code: 'INTERNAL_ERROR',
    path: req.path,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Sentry Academy API running at http://localhost:${PORT}`);
  console.log('✅ Server setup complete, all routes should be available');
});
