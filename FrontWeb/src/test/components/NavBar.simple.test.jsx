import { render, screen } from '@testing-library/react';
import NavBar from '../components/NavBar';

describe('NavBar', () => {
  it('affiche le titre', () => {
    render(<NavBar />);
    expect(screen.getByText(/Accueil/i)).toBeInTheDocument();
  });
});
