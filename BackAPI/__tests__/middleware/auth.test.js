import { jest, describe, test, beforeEach, expect } from '@jest/globals';

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  test('should return 401 if no token provided', async () => {
    const { authenticateToken } = await import('../../src/middleware/auth.js');
    
    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', async () => {
    const { authenticateToken } = await import('../../src/middleware/auth.js');
    req.headers.authorization = 'Bearer invalid_token';

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if authorization header is malformed', async () => {
    const { authenticateToken } = await import('../../src/middleware/auth.js');
    req.headers.authorization = 'InvalidFormat token123';

    await authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'unauthorized',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('environment should have JWT_SECRET', () => {
    expect(process.env.JWT_SECRET).toBeDefined();
    expect(process.env.JWT_SECRET.length).toBeGreaterThan(0);
  });
});
