import React from 'react';
import { Link } from 'react-router-dom';
import { Profile, UserRole } from '../../types';
import BookingList from '../bookings/BookingList';

interface Props {
  profile: Profile;
}

const ClientDashboard: React.FC<Props> = ({ profile }) => {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, {profile.display_name}</h1>
          <p className="text-gray-400">Ready for your next tattoo?</p>
        </div>
        <Link to="/design" className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
          <i className="fa-solid fa-plus mr-2"></i> New Idea
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-bold text-white">Your Appointments</h2>
              <BookingList role={UserRole.CLIENT} />
          </div>

          <div className="space-y-6">
             <div className="bg-ink-900 p-6 rounded-xl border border-ink-800 hover:border-brand/50 transition-colors">
                <div className="text-brand text-2xl mb-2"><i className="fa-solid fa-heart"></i></div>
                <h3 className="text-lg font-bold text-white">Saved Designs</h3>
                <p className="text-gray-400 text-sm mt-1">Coming soon...</p>
             </div>
             
             <div>
                <h2 className="text-xl font-bold text-white mb-4">Recommended Artists</h2>
                <div className="bg-ink-950 border border-dashed border-ink-800 rounded-xl p-8 text-center text-gray-500">
                    Explore styles to get recommendations.
                </div>
            </div>
          </div>
      </div>
    </div>
  );
};

export default ClientDashboard;