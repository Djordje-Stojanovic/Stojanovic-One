import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Callback: React.FC = () => {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Callback component mounted');
    console.log('isLoading:', isLoading);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('error:', error);

    if (!isLoading) {
      if (isAuthenticated) {
        console.log('User authenticated, navigating to home');
        navigate('/');
      } else if (error) {
        console.error('Authentication error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        navigate('/login');
      } else {
        console.log('User not authenticated, navigating to login');
        navigate('/login');
      }
    }
  }, [isAuthenticated, isLoading, error, navigate]);

  return <div>Processing authentication...</div>;
};

export default Callback;