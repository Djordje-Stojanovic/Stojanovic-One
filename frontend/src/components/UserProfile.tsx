import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getUserProfile, updateUserProfile } from '../utils/api';
import { User } from '../types/user';
import EditUserProfile from './EditUserProfile';

const UserProfile: React.FC = () => {
  const { user: auth0User, isAuthenticated, isLoading, logout } = useAuth0();
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to fetch user profile', error);
        setError('Failed to fetch user profile. Please try again.');
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !auth0User) {
    return <div>Please log in to view your profile.</div>;
  }

  const handleUpdate = async (updatedUser: User) => {
    try {
      const result = await updateUserProfile(updatedUser);
      setUser(result);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user profile', error);
      setError('Failed to update user profile. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h2 className="text-2xl mb-4">User Profile</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isEditing ? (
        <EditUserProfile
          user={user || { id: 0, first_name: '', last_name: '', email: auth0User.email || '' }}
          onUpdate={handleUpdate}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <img src={auth0User.picture} alt={auth0User.name} className="rounded-full mb-4" />
          <p><strong>Name:</strong> {user?.first_name} {user?.last_name}</p>
          <p><strong>Email:</strong> {auth0User.email}</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4 ml-4"
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          >
            Log Out
          </button>
        </>
      )}
    </div>
  );
};

export default UserProfile;