describe('API Health Checks', () => {
  test('Environment variables should be set', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.NODE_ENV).toBe('test');
  });

  test('JWT_SECRET should not be empty', () => {
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
  });

  test('MONGODB_URI should be defined', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI).toContain('mongodb');
  });
});
