import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';

describe('Home', () => {
  it('affiche le texte principal', () => {
    render(<Home />);
    expect(screen.getByText(/Bienvenue/i)).toBeInTheDocument();
  });
});
