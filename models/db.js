import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Create a function to connect to the database
const connectDb = async () => {
  try {
    const dbUri = process.env.MONGO_URI; // MongoDB URI from .env file
    if (!dbUri) {
      throw new Error('MongoDB URI is missing in .env');
    }

    // Connect to MongoDB
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected successfully!');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit the process with a failure code
  }
};
export default connectDb;