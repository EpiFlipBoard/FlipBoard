import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Database Connection', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('should connect to MongoDB', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('should have correct database name', () => {
    expect(mongoose.connection.name).toBe('myflip_test');
  });
});
