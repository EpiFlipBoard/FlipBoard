import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load env vars: prefer .env.test, fallback to .env
dotenv.config({ path: '.env.test' });
if (!process.env.MONGODB_URI) {
  dotenv.config();
}

// Ensure we use a test database to avoid wiping development data
if (process.env.MONGODB_URI) {
  // Replace database name with myflip_test
  // Pattern matches the last slash followed by anything not a slash or question mark, 
  // ensuring we replace the DB name part of the connection string
  process.env.MONGODB_URI = process.env.MONGODB_URI.replace(
    /(\/[^/?]+)(\?|$)/, 
    '/myflip_test$2'
  );
}

process.env.NODE_ENV = 'test';

// Global test timeout is set in jest.config.js (testTimeout: 30000)

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
