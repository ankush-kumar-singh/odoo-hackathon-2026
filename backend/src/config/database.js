import mongoose from 'mongoose';

const connectDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/transitops';

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
  });

  return mongoose.connection;
};

export default connectDatabase;
