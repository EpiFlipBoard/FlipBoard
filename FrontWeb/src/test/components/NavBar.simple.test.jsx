import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import NavBar from '../../components/NavBar';
import { ThemeProvider } from '../../components/ThemeProvider';

// Mock auth
vi.mock('../../lib/auth', () => ({
  getToken: vi.fn(() => null),
  getUser: vi.fn(() => null),
  setAuth: vi.fn(),
  clearAuth: vi.fn(),
  authFetch: vi.fn(),
}));

describe('NavBar', () => {
  it('affiche le titre', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <NavBar />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/EPI-FLIPBOARD/i)).toBeInTheDocument();
  });
});
