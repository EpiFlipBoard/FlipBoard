import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: '.env.test' });

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
