import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login: React.FC = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = async () => {
    try {
      console.log('Initiating login process');
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname }
      });
      console.log('Login redirect completed');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl mb-4">Login</h2>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        onClick={handleLogin}
      >
        Log In with Auth0
      </button>
    </div>
  );
};

export default Login;