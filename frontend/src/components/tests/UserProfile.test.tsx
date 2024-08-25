import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfile from '../UserProfile';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserProfile } from '../../utils/api';

jest.mock('@auth0/auth0-react');
jest.mock('../../utils/api');

const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;
const mockGetUserProfile = getUserProfile as jest.MockedFunction<typeof getUserProfile>;

describe('UserProfile', () => {
  beforeEach(() => {
    mockUseAuth0.mockReturnValue({
      isAuthenticated: true,
      user: { name: 'Test User', email: 'test@example.com', picture: 'https://example.com/picture.jpg' },
      isLoading: false,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
    } as any);

    mockGetUserProfile.mockResolvedValue({
      id: 1,
      first_name: 'Test',
      last_name: 'User',
      email: 'test@example.com',
    });
  });

  it('renders user profile when authenticated', async () => {
    render(<UserProfile />);

    await waitFor(() => {
      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  it('shows loading state', () => {
    mockUseAuth0.mockReturnValueOnce({
      isAuthenticated: true,
      isLoading: true,
      user: undefined,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
    } as any);

    render(<UserProfile />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows login message when not authenticated', () => {
    mockUseAuth0.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: undefined,
      logout: jest.fn(),
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      getIdTokenClaims: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
    } as any);

    render(<UserProfile />);

    expect(screen.getByText('Please log in to view your profile.')).toBeInTheDocument();
  });
});