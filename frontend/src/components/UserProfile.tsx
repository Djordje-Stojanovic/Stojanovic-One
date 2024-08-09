import React, { useState, useEffect } from 'react';
import api from '../utils/api';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/users/me');
        setUser(response.data);
      } catch (err) {
        setError('Failed to fetch user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!user) return <div>No user data available</div>;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
      <h2 className="text-2xl font-bold mb-4">User Profile</h2>
      <div className="mb-4">
        <strong>Email:</strong> {user.email}
      </div>
      <div className="mb-4">
        <strong>First Name:</strong> {user.first_name || 'Not set'}
      </div>
      <div className="mb-4">
        <strong>Last Name:</strong> {user.last_name || 'Not set'}
      </div>
      <div className="mb-4">
        <strong>Active:</strong> {user.is_active ? 'Yes' : 'No'}
      </div>
    </div>
  );
};

export default UserProfile;
