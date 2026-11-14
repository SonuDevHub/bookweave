
import mongoose from 'mongoose'

// Connect to MongoDB
export async function connectDB() {
  const mongoURI = process.env.MONGODB_URI

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing from .env')
  }

  await mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
  })

  console.log('MongoDB connected successfully')
}
