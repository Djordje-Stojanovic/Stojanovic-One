import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from './Home';

describe('Home component', () => {
  it('renders welcome message', () => {
    render(<Home />);
    const welcomeMessage = screen.getByText(/Welcome to Stojanovic-One/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});
