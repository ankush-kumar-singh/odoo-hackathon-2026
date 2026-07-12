import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import connectDatabase, { gracefulShutdown } from './config/database.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use('/api', routes);

const startServer = async () => {
  await connectDatabase();

  const server = app.listen(port, () => {
    console.log(`TransitOps backend listening on port ${port}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received. Stopping HTTP server...`);
    server.close(async () => {
      await gracefulShutdown(signal);
    });
  };

  process.on('SIGINT', () => {
    shutdown('SIGINT').catch(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    shutdown('SIGTERM').catch(() => process.exit(1));
  });
};

startServer().catch((error) => {
  console.error('Failed to start TransitOps backend:', error);
  process.exit(1);
});

export default app;
