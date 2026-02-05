import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../components/NavBar';

// Mock auth
vi.mock('../../lib/auth', () => ({
  getToken: vi.fn(() => null),
  getUser: vi.fn(() => null),
  isAuthenticated: vi.fn(() => false),
}));

describe('NavBar Component', () => {
  test('renders navigation bar', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    
    // NavBar should render
    expect(document.querySelector('nav')).toBeTruthy();
  });

  test('NavBar is defined', () => {
    expect(NavBar).toBeDefined();
  });
});
