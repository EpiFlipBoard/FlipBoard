import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import { ThemeProvider } from '../components/ThemeProvider';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(
      <BrowserRouter>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </BrowserRouter>
    );
    
    // App should render something
    expect(document.body).toBeTruthy();
  });

  test('App is defined', () => {
    expect(App).toBeDefined();
  });
});
