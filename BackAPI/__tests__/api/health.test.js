import mongoose from 'mongoose';

describe('API Health Checks', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }
  });

  test('MongoDB should be connected', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('Environment variables should be set', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('JWT_SECRET should not be empty', () => {
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
  });
});
