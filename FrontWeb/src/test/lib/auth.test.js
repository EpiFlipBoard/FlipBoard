import { describe, test, expect, beforeEach } from 'vitest';
import { getToken, getUser, setAuth, clearAuth, getUserInitial } from '../../lib/auth';

describe('Auth Utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('getToken returns empty string when no token', () => {
    expect(getToken()).toBe('');
  });

  test('setAuth stores token in localStorage', () => {
    const token = 'test-token-123';
    const user = { name: 'Test User', email: 'test@example.com' };
    setAuth(token, user);
    expect(localStorage.getItem('epi_token')).toBe(token);
  });

  test('getToken retrieves stored token', () => {
    const token = 'test-token-456';
    localStorage.setItem('epi_token', token);
    expect(getToken()).toBe(token);
  });

  test('clearAuth clears token and user from localStorage', () => {
    localStorage.setItem('epi_token', 'test-token');
    localStorage.setItem('epi_user', JSON.stringify({ name: 'Test' }));
    clearAuth();
    expect(localStorage.getItem('epi_token')).toBeNull();
    expect(localStorage.getItem('epi_user')).toBeNull();
  });

  test('getUser returns null when no user', () => {
    expect(getUser()).toBeNull();
  });

  test('getUser returns parsed user object', () => {
    const user = { name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('epi_user', JSON.stringify(user));
    expect(getUser()).toEqual(user);
  });

  test('getUserInitial returns first letter of name', () => {
    const user = { name: 'John Doe' };
    expect(getUserInitial(user)).toBe('J');
  });

  test('getUserInitial returns first letter of email if no name', () => {
    const user = { email: 'test@example.com' };
    expect(getUserInitial(user)).toBe('T');
  });

  test('getUserInitial returns empty string for null user', () => {
    expect(getUserInitial(null)).toBe('');
  });
});
