import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Booking, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface Props {
  role: UserRole;
}

const BookingList: React.FC<Props> = ({ role }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchBookings = async () => {
      // Determine which column to match based on role
      const column = role === UserRole.ARTIST ? 'artist_id' : 'client_id';
      // Determine which relation to fetch
      const relation = role === UserRole.ARTIST ? 'client:profiles!client_id(display_name)' : 'artist:profiles!artist_id(display_name)';

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          ${relation}
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false });

      if (error) console.error(error);
      if (data) setBookings(data as any);
      setLoading(false);
    };

    fetchBookings();
  }, [user, role]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-900/50 text-yellow-200 border-yellow-800';
      case 'ACCEPTED': return 'bg-green-900/50 text-green-200 border-green-800';
      case 'DECLINED': return 'bg-red-900/50 text-red-200 border-red-800';
      case 'COMPLETED': return 'bg-blue-900/50 text-blue-200 border-blue-800';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-500">Loading bookings...</div>;

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-ink-950 border border-dashed border-ink-800 rounded-xl">
        <i className="fa-solid fa-calendar-xmark text-4xl text-ink-700 mb-4"></i>
        <p className="text-gray-400">No bookings found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Link 
          key={booking.id} 
          to={`/bookings/${booking.id}`}
          className="block bg-ink-900 border border-ink-800 rounded-xl p-4 hover:border-brand/50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-xs rounded border ${getStatusColor(booking.status)}`}>
                  {booking.status}
                </span>
                <span className="text-sm text-gray-400">
                  {new Date(booking.requested_date).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg">
                {role === UserRole.ARTIST 
                  ? booking.client?.display_name || 'Client' 
                  : booking.artist?.display_name || 'Artist'
                }
              </h3>
              <p className="text-gray-400 text-sm mt-1 truncate max-w-md">{booking.description}</p>
            </div>
            <div className="text-right">
              <i className="fa-solid fa-chevron-right text-gray-600"></i>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BookingList;