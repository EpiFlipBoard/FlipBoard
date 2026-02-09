import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../components/NavBar';
import { ThemeProvider } from '../../components/ThemeProvider';

// Mock auth
vi.mock('../../lib/auth', () => ({
  getToken: vi.fn(() => null),
  getUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  authFetch: vi.fn(),
}));

describe('NavBar Component', () => {
  test('renders navigation bar', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <NavBar />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // NavBar should render
    expect(document.querySelector('nav')).toBeTruthy();
  });

  test('NavBar is defined', () => {
    expect(NavBar).toBeDefined();
  });
});
