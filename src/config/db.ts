import mongoose from 'mongoose';
import config from './index';

export async function connectDB(): Promise<void> {
  if (config.database.useInMemory) return;

  const uri = config.database.mongoUri;
  try {
    await mongoose.connect(uri, {
      // useNewUrlParser and useUnifiedTopology are defaults in mongoose v6+
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    throw err;
  }
}

export default connectDB;
