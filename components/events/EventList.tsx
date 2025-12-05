
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { InkEvent, EventType, UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

const EventList: React.FC = () => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<InkEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterType, setFilterType] = useState<EventType | ''>('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filterType, filterLocation, showPast]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(display_name, avatar_url)
        `)
        .order('start_date', { ascending: true });

      if (filterType) {
        query = query.eq('type', filterType);
      }
      
      if (filterLocation) {
        query = query.ilike('location', `%${filterLocation}%`);
      }

      if (!showPast) {
        query = query.gte('end_date', new Date().toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data as InkEvent[] || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-gray-400 mt-1">Conventions, guest spots, and community gatherings.</p>
        </div>
        
        {profile?.role === UserRole.ARTIST && (
          <Link 
            to="/events/new" 
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors shadow-lg shadow-brand/20 flex items-center gap-2"
          >
            <i className="fa-solid fa-plus"></i> Create Event
          </Link>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4 space-y-6">
          <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
            <h3 className="text-white font-medium mb-4">Filter Events</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Event Type</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as EventType | '')}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg p-2.5 text-white focus:border-brand focus:outline-none text-sm"
                >
                  <option value="">All Types</option>
                  <option value={EventType.CONVENTION}>Convention</option>
                  <option value={EventType.GUEST_SPOT}>Guest Spot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1 uppercase tracking-wide">Location</label>
                <div className="relative">
                  <i className="fa-solid fa-location-dot absolute left-3 top-3 text-gray-500 text-xs"></i>
                  <input
                    type="text"
                    placeholder="City, State..."
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg pl-8 pr-3 py-2.5 text-white focus:border-brand focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showPast"
                  checked={showPast}
                  onChange={(e) => setShowPast(e.target.checked)}
                  className="rounded border-ink-700 bg-ink-950 text-brand focus:ring-brand"
                />
                <label htmlFor="showPast" className="text-sm text-gray-400 select-none cursor-pointer">Show past events</label>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="lg:w-3/4">
          {loading ? (
             <div className="text-center py-20 text-gray-500">Loading events...</div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 bg-ink-900 rounded-xl border border-dashed border-ink-800">
              <i className="fa-regular fa-calendar-xmark text-4xl text-ink-700 mb-4"></i>
              <p className="text-gray-400">No events found.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {events.map((event) => (
                <div key={event.id} className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden hover:border-brand/50 transition-all flex flex-col md:flex-row">
                  {/* Date Badge / Image placeholder */}
                  <div className="md:w-48 bg-ink-950 flex flex-col items-center justify-center p-6 border-b md:border-b-0 md:border-r border-ink-800">
                     <span className="text-3xl font-bold text-brand">{new Date(event.start_date).getDate()}</span>
                     <span className="text-lg font-medium text-white uppercase">{new Date(event.start_date).toLocaleString('default', { month: 'short' })}</span>
                     <span className="text-gray-500 text-sm mt-1">{new Date(event.start_date).getFullYear()}</span>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                          event.type === EventType.CONVENTION 
                            ? 'bg-purple-900/20 text-purple-200 border-purple-800' 
                            : 'bg-blue-900/20 text-blue-200 border-blue-800'
                        }`}>
                          {event.type.replace('_', ' ')}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                         <span><i className="fa-solid fa-location-dot mr-1"></i> {event.location}</span>
                         {event.venue && <span><i className="fa-solid fa-building mr-1"></i> {event.venue}</span>}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-ink-800 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            {event.organizer?.avatar_url && (
                                <img src={event.organizer.avatar_url} className="w-6 h-6 rounded-full" alt="Organizer" />
                            )}
                            <span className="text-sm text-gray-500">
                                Organized by <span className="text-gray-300">{event.organizer?.display_name || 'Unknown'}</span>
                            </span>
                        </div>
                        <Link 
                          to={`/events/${event.id}`} 
                          className="text-brand hover:text-white font-medium text-sm"
                        >
                          View Details <i className="fa-solid fa-arrow-right ml-1"></i>
                        </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventList;
