import React, { useState } from 'react';
import { Profile, UserRole } from '../../types';
import PortfolioManager from './PortfolioManager';
import DesignManager from './DesignManager';
import BookingList from '../bookings/BookingList';

interface Props {
  profile: Profile;
}

const ArtistDashboard: React.FC<Props> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'flash' | 'bookings'>('overview');

  return (
     <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-ink-900 rounded-xl p-6 border border-ink-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Studio, {profile.display_name}</h1>
          <p className="text-gray-400">Manage your presence and sales.</p>
        </div>
        
        <div className="flex bg-ink-950 p-1 rounded-lg border border-ink-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-ink-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'bookings' ? 'bg-ink-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Bookings
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'portfolio' ? 'bg-ink-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab('flash')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'flash' ? 'bg-ink-800 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Artist Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
                <h3 className="text-gray-400 text-sm font-medium">Profile Views</h3>
                <p className="text-2xl font-bold text-white mt-2">0</p>
            </div>
            <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
                <h3 className="text-gray-400 text-sm font-medium">Active Bookings</h3>
                <p className="text-2xl font-bold text-white mt-2">Check Tab</p>
            </div>
             <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
                <h3 className="text-gray-400 text-sm font-medium">Flash Sales</h3>
                <p className="text-2xl font-bold text-white mt-2">$0.00</p>
            </div>
            <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
                <h3 className="text-gray-400 text-sm font-medium">Rating</h3>
                <p className="text-2xl font-bold text-white mt-2">N/A</p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'bookings' && <BookingList role={UserRole.ARTIST} />}
      {activeTab === 'portfolio' && <PortfolioManager />}
      {activeTab === 'flash' && <DesignManager />}

    </div>
  );
};

export default ArtistDashboard;