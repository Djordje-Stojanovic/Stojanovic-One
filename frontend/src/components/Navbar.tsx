import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth0();

  return (
    <nav className="bg-blue-500 p-4">
      <ul className="flex space-x-4">
        <li><Link to="/" className="text-white hover:underline">Home</Link></li>
        {!isAuthenticated && (
          <>
            <li><Link to="/login" className="text-white hover:underline">Login</Link></li>
            <li><Link to="/register" className="text-white hover:underline">Register</Link></li>
          </>
        )}
        {isAuthenticated && (
          <>
            <li><Link to="/profile" className="text-white hover:underline">Profile</Link></li>
            <li>
              <button
                className="text-white hover:underline"
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
              >
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;