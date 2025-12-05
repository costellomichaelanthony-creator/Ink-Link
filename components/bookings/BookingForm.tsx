import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { Profile } from '../../types';

const BookingForm: React.FC = () => {
  const [searchParams] = useSearchParams();
  const artistId = searchParams.get('artistId');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [artist, setArtist] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState('');
  const [timeWindow, setTimeWindow] = useState('Afternoon');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');

  useEffect(() => {
    if (!artistId) {
        navigate('/artists');
        return;
    }
    const fetchArtist = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', artistId).single();
        if (data) setArtist(data);
    };
    fetchArtist();
  }, [artistId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !artistId) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
            client_id: user.id,
            artist_id: artistId,
            status: 'PENDING',
            requested_date: date,
            requested_time_window: timeWindow,
            description: description,
            budget_cents_min: budgetMin ? parseInt(budgetMin) * 100 : null,
            budget_cents_max: budgetMax ? parseInt(budgetMax) * 100 : null,
            reference_image_urls: []
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/bookings/${data.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit booking request.');
    } finally {
      setLoading(false);
    }
  };

  if (!artist) return <div className="p-12 text-center text-gray-500">Loading booking form...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Book an Appointment</h2>
        <div className="flex items-center gap-4 mb-8 bg-ink-950 p-4 rounded-lg border border-ink-800">
            {artist.avatar_url && <img src={artist.avatar_url} alt={artist.display_name} className="w-12 h-12 rounded-full object-cover" />}
            <div>
                <p className="text-gray-400 text-sm">Requesting Artist</p>
                <p className="font-bold text-white text-lg">{artist.display_name}</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            {error && <div className="p-3 bg-red-900/50 text-red-200 rounded border border-red-800">{error}</div>}
            
            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Requested Date</label>
                <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Preferred Time</label>
                <select
                    value={timeWindow}
                    onChange={(e) => setTimeWindow(e.target.value)}
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                >
                    <option value="Morning">Morning (10am - 1pm)</option>
                    <option value="Afternoon">Afternoon (1pm - 5pm)</option>
                    <option value="Evening">Evening (5pm - 8pm)</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Concept Description</label>
                <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    placeholder="Describe your tattoo idea, placement, and size..."
                    className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Budget Range ($)</label>
                <div className="flex gap-4">
                    <input 
                        type="number" 
                        placeholder="Min"
                        value={budgetMin}
                        onChange={(e) => setBudgetMin(e.target.value)}
                        className="w-1/2 bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    />
                    <input 
                        type="number" 
                        placeholder="Max"
                        value={budgetMax}
                        onChange={(e) => setBudgetMax(e.target.value)}
                        className="w-1/2 bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
                    />
                </div>
            </div>

            <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => navigate(-1)} className="w-1/3 py-3 bg-transparent text-gray-400 border border-ink-700 rounded-lg hover:text-white">Cancel</button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-2/3 py-3 bg-brand text-white font-bold rounded-lg hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all flex justify-center items-center"
                >
                    {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Submit Request'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;