import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';

describe('Home', () => {
  it('affiche le texte principal', () => {
    render(
      <BrowserRouter>
        <Home />
      </BrowserRouter>
    );
    expect(screen.getByText(/RESTEZ INFORMÉS/i)).toBeInTheDocument();
  });
});
