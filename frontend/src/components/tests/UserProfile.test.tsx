import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from '../UserProfile';
import { AuthProvider } from '../../context/AuthContext';
import { BrowserRouter as Router } from 'react-router-dom';
import * as api from '../../utils/api';

jest.mock('../../utils/api');
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    isAuthenticated: true,
    logout: jest.fn(),
  }),
}));

const mockUser = {
  id: 1,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
};

describe('UserProfile component', () => {
  beforeEach(() => {
    (api.getUserProfile as jest.Mock).mockResolvedValue(mockUser);
  });

  it('renders loading state initially and then user profile', async () => {
    render(
      <Router>
        <AuthProvider>
          <UserProfile />
        </AuthProvider>
      </Router>
    );

    // Check for loading state
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();

    // Wait for and check user profile content
    await waitFor(() => {
      expect(screen.getByText(/User Profile/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/John/i)).toBeInTheDocument();
    expect(screen.getByText(/Doe/i)).toBeInTheDocument();
  });
});