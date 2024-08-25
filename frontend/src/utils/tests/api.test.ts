import axios from 'axios';
import { getUserProfile, updateUserProfile, handleApiError } from '../api';
import { useAuth0 } from '@auth0/auth0-react';

jest.mock('axios');
jest.mock('@auth0/auth0-react');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockUseAuth0 = useAuth0 as jest.MockedFunction<typeof useAuth0>;

describe('API functions', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockUseAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue('mock-token'),
      isAuthenticated: true,
      user: null,
      isLoading: false,
      loginWithRedirect: jest.fn(),
      logout: jest.fn(),
      getIdTokenClaims: jest.fn(),
      getAccessTokenWithPopup: jest.fn(),
      loginWithPopup: jest.fn(),
      handleRedirectCallback: jest.fn(),
    } as any);
  });

  it('getUserProfile fetches user data', async () => {
    const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
    mockedAxios.get.mockResolvedValue({ data: mockUser });

    const result = await getUserProfile();

    expect(result).toEqual(mockUser);
    expect(mockedAxios.get).toHaveBeenCalledWith('/users/me');
  });

  it('updateUserProfile updates user data', async () => {
    const mockUser = { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@example.com' };
    const updateData = { first_name: 'Jane' };
    mockedAxios.put.mockResolvedValue({ data: { ...mockUser, ...updateData } });

    const result = await updateUserProfile(updateData);

    expect(result).toEqual({ ...mockUser, ...updateData });
    expect(mockedAxios.put).toHaveBeenCalledWith('/users/me', updateData);
  });

  it('handleApiError throws an error with the correct message', () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: { detail: 'Test error message' },
      },
    };

    expect(() => handleApiError(mockError)).toThrow('Test error message');
  });
});