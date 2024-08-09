import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated) {
        try {
          const response = await api.get('/users/me');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile', error);
          setError('Failed to fetch user profile. Please try again.');
        }
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl mb-4">User Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
      <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
    </div>
  );
};

export default UserProfile;