
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { EventType } from '../../types';
import { useAuth } from '../../context/AuthContext';

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    type: EventType.GUEST_SPOT,
    location: '',
    venue: '',
    start_date: '',
    end_date: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
        const { data, error } = await supabase
            .from('events')
            .insert({
                organizer_id: user.id,
                title: formData.title,
                type: formData.type,
                location: formData.location,
                venue: formData.venue,
                start_date: new Date(formData.start_date).toISOString(),
                end_date: new Date(formData.end_date).toISOString(),
                description: formData.description
            })
            .select()
            .single();

        if (error) throw error;
        navigate(`/events/${data.id}`);
    } catch (err: any) {
        setError(err.message || "Failed to create event");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Create New Event</h2>
        
        {error && <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded border border-red-800 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Event Title</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g. NYC Guest Spot"
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as EventType})}
                        className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    >
                        <option value={EventType.GUEST_SPOT}>Guest Spot</option>
                        <option value={EventType.CONVENTION}>Convention</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">City/Location</label>
                    <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. Los Angeles, CA"
                        className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Venue Name (Optional)</label>
                <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    placeholder="e.g. Ink Master Studio / Convention Center"
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Start Date</label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.start_date}
                        onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                        className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">End Date</label>
                    <input
                        type="datetime-local"
                        required
                        value={formData.end_date}
                        onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                        className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Describe the event details..."
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-ink-800">
                <button 
                    type="button" 
                    onClick={() => navigate('/events')}
                    className="px-6 py-2 bg-transparent text-gray-400 hover:text-white"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover font-bold shadow-lg shadow-brand/20"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Publish Event'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
