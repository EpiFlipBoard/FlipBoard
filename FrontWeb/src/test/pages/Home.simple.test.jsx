import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Home from '../../pages/Home';
import { ThemeProvider } from '../../components/ThemeProvider';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ posts: [], hasMore: false }),
  })
);

describe('Home', () => {
  it('affiche le texte principal', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      </BrowserRouter>
    );
    expect(screen.getByText(/RESTEZ INFORMÉS/i)).toBeInTheDocument();
  });
});
