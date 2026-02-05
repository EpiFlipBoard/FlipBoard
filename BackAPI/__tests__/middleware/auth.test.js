import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../src/middleware/auth.js';

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

  test('should return 401 if no token provided', () => {
    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Access denied. No token provided.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 403 if token is invalid', () => {
    req.headers.authorization = 'Bearer invalid_token';

    authenticateToken(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() with valid token', () => {
    const userId = 'user123';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    authenticateToken(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should work with lowercase bearer', () => {
    const userId = 'user456';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    req.headers.authorization = `bearer ${token}`;

    authenticateToken(req, res, next);

    expect(req.user.userId).toBe(userId);
    expect(next).toHaveBeenCalled();
  });
});
