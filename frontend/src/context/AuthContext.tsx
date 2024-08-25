import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth0, User, LogoutOptions } from '@auth0/auth0-react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  user: User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, loginWithRedirect, logout, user } = useAuth0();

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login: loginWithRedirect,
        logout: () => logout({ logoutParams: { returnTo: window.location.origin } } as LogoutOptions),
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};