import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EditUserProfile from './EditUserProfile';

interface User {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

const UserProfile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await api.get('/auth/me');
        setUser(response.data);
      } catch (error: any) {
        console.error('Failed to fetch user profile', error);
        if (error.response && error.response.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError('Failed to fetch user profile. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated, logout, navigate]);

  const handleUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        await api.delete('/users/me');
        localStorage.removeItem('token');
        logout();
        navigate('/');
      } catch (error) {
        console.error('Failed to delete user account', error);
        setError('Failed to delete user account. Please try again.');
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div>Please log in to view your profile.</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isEditing) {
    return <EditUserProfile user={user} onUpdate={handleUpdate} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl mb-4">User Profile</h2>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>First Name:</strong> {user.first_name || 'Not set'}</p>
      <p><strong>Last Name:</strong> {user.last_name || 'Not set'}</p>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 mr-2"
        onClick={() => setIsEditing(true)}
      >
        Edit Profile
      </button>
      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
        onClick={handleDelete}
      >
        Delete Account
      </button>
    </div>
  );
};

export default UserProfile;