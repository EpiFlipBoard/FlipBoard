import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // App should render something
    expect(document.body).toBeTruthy();
  });

  test('App is defined', () => {
    expect(App).toBeDefined();
  });
});
