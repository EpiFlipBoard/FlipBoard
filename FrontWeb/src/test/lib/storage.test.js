import { describe, test, expect } from 'vitest';

// Test des utilitaires de storage
describe('Storage Utils', () => {
  test('localStorage should be available', () => {
    expect(localStorage).toBeDefined();
  });

  test('can set and get items from localStorage', () => {
    localStorage.setItem('test', 'value');
    expect(localStorage.getItem('test')).toBe('value');
    localStorage.removeItem('test');
  });

  test('can clear localStorage', () => {
    localStorage.setItem('test1', 'value1');
    localStorage.setItem('test2', 'value2');
    localStorage.clear();
    expect(localStorage.getItem('test1')).toBeNull();
    expect(localStorage.getItem('test2')).toBeNull();
  });
});
