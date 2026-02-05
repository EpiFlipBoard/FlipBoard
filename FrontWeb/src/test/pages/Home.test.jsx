import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

describe('Home Page', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    
    expect(container).toBeTruthy();
  });

  test('Home component is defined', () => {
    expect(Home).toBeDefined();
  });
});
