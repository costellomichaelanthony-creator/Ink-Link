import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import ClientDashboard from './ClientDashboard';
import ArtistDashboard from './ArtistDashboard';

const Dashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return <div className="p-12 text-center text-gray-500">Loading dashboard...</div>;
  }

  if (!profile) {
    return <div className="p-12 text-center text-red-500">Error loading profile data.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {profile.role === UserRole.ARTIST ? (
        <ArtistDashboard profile={profile} />
      ) : (
        <ClientDashboard profile={profile} />
      )}
    </div>
  );
};

export default Dashboard;