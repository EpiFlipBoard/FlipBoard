import { describe, test, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { ThemeProvider } from '../../components/ThemeProvider';

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ posts: [], hasMore: false }),
  })
);

describe('Home Page', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <ThemeProvider>
          <Home />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  test('Home component is defined', () => {
    expect(Home).toBeDefined();
  });
});
