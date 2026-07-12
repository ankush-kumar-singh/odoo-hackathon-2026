import mongoose from 'mongoose';

const isProduction = process.env.NODE_ENV === 'production';

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI must be configured before starting the backend.');
  }

  mongoose.set('strictQuery', true);

  mongoose.connection.on('connected', () => {
    console.log(`MongoDB connected to ${mongoose.connection.host}:${mongoose.connection.port}`);
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected.');
  });

  await mongoose.connect(mongoUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: isProduction ? 10 : 5,
  });

  return mongoose.connection;
};

const gracefulShutdown = async (signal) => {
  console.log(`${signal} received. Closing MongoDB connection...`);
  await mongoose.disconnect();
  process.exit(0);
};

process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch(() => process.exit(1));
});

process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch(() => process.exit(1));
});

export { gracefulShutdown };
export default connectDatabase;
