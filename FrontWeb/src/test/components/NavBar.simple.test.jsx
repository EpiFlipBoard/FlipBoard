import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from '../../components/NavBar';

describe('NavBar', () => {
  it('affiche le titre', () => {
    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );
    expect(screen.getByText(/EPI-FLIPBOARD/i)).toBeInTheDocument();
  });
});
