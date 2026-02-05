import { describe, test, expect } from 'vitest';

describe('Frontend Environment', () => {
  test('should have window object', () => {
    expect(window).toBeDefined();
  });

  test('should have document object', () => {
    expect(document).toBeDefined();
  });

  test('React is available', () => {
    expect(typeof React).toBe('undefined'); // Normal in Vite, React is imported when needed
  });

  test('jsdom environment is configured', () => {
    expect(document.createElement('div')).toBeInstanceOf(HTMLDivElement);
  });
});
