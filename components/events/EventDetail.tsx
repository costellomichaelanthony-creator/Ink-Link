
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { InkEvent, EventType } from '../../types';
import { useAuth } from '../../context/AuthContext';

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [event, setEvent] = useState<InkEvent | null>(null);
  const [rsvpStatus, setRsvpStatus] = useState<'INTERESTED' | 'GOING' | null>(null);
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchEventData();
      if (user) fetchRsvpStatus();
      fetchAttendeeCount();
    }
  }, [id, user]);

  const fetchEventData = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(id, display_name, avatar_url, role)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setEvent(data as InkEvent);
    } catch (err) {
      console.error(err);
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRsvpStatus = async () => {
    if (!user || !id) return;
    const { data } = await supabase
      .from('event_attendees')
      .select('status')
      .eq('event_id', id)
      .eq('user_id', user.id)
      .single();
    
    if (data) setRsvpStatus(data.status as any);
  };

  const fetchAttendeeCount = async () => {
    if (!id) return;
    const { count } = await supabase
      .from('event_attendees')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id);
    
    setAttendeeCount(count || 0);
  };

  const handleRsvp = async (status: 'INTERESTED' | 'GOING') => {
    if (!user) {
        alert("Please login to RSVP");
        return;
    }
    if (!id) return;

    if (rsvpStatus === status) {
        // Toggle off (remove RSVP)
        await supabase
            .from('event_attendees')
            .delete()
            .eq('event_id', id)
            .eq('user_id', user.id);
        setRsvpStatus(null);
        setAttendeeCount(prev => prev - 1);
    } else {
        // Upsert
        const { error } = await supabase
            .from('event_attendees')
            .upsert({
                event_id: id,
                user_id: user.id,
                status: status
            });
        
        if (!error) {
            // Adjust count logic locally for immediate feedback
            if (!rsvpStatus) setAttendeeCount(prev => prev + 1);
            setRsvpStatus(status);
        }
    }
  };

  if (loading || !event) return <div className="text-center py-20 text-gray-500">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/events" className="text-gray-400 hover:text-white mb-6 inline-block">
        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Events
      </Link>

      <div className="bg-ink-900 rounded-2xl border border-ink-800 overflow-hidden">
         {/* Hero / Cover */}
         <div className="bg-gradient-to-r from-ink-950 to-ink-900 p-8 md:p-12 border-b border-ink-800 relative overflow-hidden">
             <div className="relative z-10">
                <span className={`inline-block px-3 py-1 rounded text-xs font-bold tracking-wider mb-4 border ${
                    event.type === EventType.CONVENTION 
                    ? 'bg-purple-900/20 text-purple-200 border-purple-800' 
                    : 'bg-blue-900/20 text-blue-200 border-blue-800'
                }`}>
                    {event.type.replace('_', ' ')}
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">{event.title}</h1>
                <div className="flex flex-col md:flex-row gap-6 text-gray-300">
                    <div className="flex items-center gap-2">
                        <i className="fa-regular fa-calendar text-brand"></i>
                        <span>
                            {new Date(event.start_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-location-dot text-brand"></i>
                        <span>{event.venue ? `${event.venue}, ` : ''}{event.location}</span>
                    </div>
                </div>
             </div>
             {/* Decorative element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3">
             {/* Main Content */}
             <div className="lg:col-span-2 p-8 border-r border-ink-800">
                 <h2 className="text-xl font-bold text-white mb-4">About Event</h2>
                 <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                     {event.description || "No description provided."}
                 </p>

                 <div className="mt-8 pt-8 border-t border-ink-800">
                     <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-4">Organizer</h3>
                     <Link to={`/artists/${event.organizer?.id}`} className="flex items-center gap-4 hover:bg-ink-800 p-3 rounded-lg -ml-3 transition-colors w-fit">
                         {event.organizer?.avatar_url ? (
                             <img src={event.organizer.avatar_url} className="w-12 h-12 rounded-full object-cover" alt={event.organizer.display_name} />
                         ) : (
                             <div className="w-12 h-12 rounded-full bg-ink-700 flex items-center justify-center text-gray-400 font-bold text-lg">
                                 {event.organizer?.display_name.charAt(0)}
                             </div>
                         )}
                         <div>
                             <p className="font-bold text-white">{event.organizer?.display_name}</p>
                             <p className="text-xs text-gray-500">View Profile</p>
                         </div>
                     </Link>
                 </div>
             </div>

             {/* Sidebar Actions */}
             <div className="p-8 bg-ink-950/50">
                 <div className="bg-ink-900 border border-ink-800 rounded-xl p-6 text-center">
                     <p className="text-gray-400 text-sm mb-2">Are you attending?</p>
                     <div className="flex justify-center gap-3 mb-4">
                         <button 
                            onClick={() => handleRsvp('INTERESTED')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                rsvpStatus === 'INTERESTED' 
                                ? 'bg-yellow-900/30 text-yellow-200 border-yellow-700' 
                                : 'bg-ink-950 text-gray-400 border-ink-700 hover:border-gray-500'
                            }`}
                         >
                             <i className="fa-regular fa-star mr-1"></i> Interested
                         </button>
                         <button 
                            onClick={() => handleRsvp('GOING')}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                                rsvpStatus === 'GOING' 
                                ? 'bg-green-900/30 text-green-200 border-green-700' 
                                : 'bg-ink-950 text-gray-400 border-ink-700 hover:border-gray-500'
                            }`}
                         >
                             <i className="fa-solid fa-check mr-1"></i> Going
                         </button>
                     </div>
                     <p className="text-xs text-gray-500">{attendeeCount} people responded</p>
                 </div>

                 {/* Map Placeholder */}
                 <div className="mt-6 bg-ink-900 border border-ink-800 rounded-xl h-48 flex items-center justify-center text-gray-600">
                     <div className="text-center">
                        <i className="fa-solid fa-map-location-dot text-2xl mb-2"></i>
                        <p className="text-sm">Map View</p>
                     </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
};

export default EventDetail;
