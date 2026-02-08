import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

describe('Database Configuration', () => {
  test('should have MongoDB URI configured', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('mongodb');
  });

  test('should have test database name in URI', () => {
    expect(process.env.MONGODB_URI).toContain('myflip_test');
  });

  test('should have required environment variables', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.NODE_ENV).toBe('test');
  });
});
