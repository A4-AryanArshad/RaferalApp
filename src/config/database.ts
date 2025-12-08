import mongoose from 'mongoose';

// Hardcoded MongoDB connection string
const MONGODB_URI = 'mongodb+srv://ali:o2dVBwPDYbPAotAJ@cluster0.o8bu9nt.mongodb.net/airbnb-referral-app?retryWrites=true&w=majority';

// Cache connection for serverless environments (Vercel, etc.)
let cachedConnection: typeof mongoose | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    // Reuse existing connection if available (for serverless)
    if (cachedConnection && mongoose.connection.readyState === 1) {
      return;
    }

    // Connection options optimized for serverless
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    };

    const connection = await mongoose.connect(MONGODB_URI, options);
    cachedConnection = connection;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    cachedConnection = null; // Reset on error
    throw error;
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});



