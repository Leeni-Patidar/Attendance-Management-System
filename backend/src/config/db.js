/*
  config/db.js - MongoDB connection helper using Mongoose
*/
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI;

async function connectDB() {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI is not set in environment variables');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(MONGO_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: Number(process.env.DB_MAX_POOL || 10),
    });

    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}`);

    return conn;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Mongo connection error:', error);
    throw error;
  }
}

export default connectDB;
