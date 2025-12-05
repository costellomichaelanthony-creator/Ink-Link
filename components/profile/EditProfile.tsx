import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

const EditProfile: React.FC = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [formData, setFormData] = useState({
    display_name: '',
    location: '',
    bio: '',
    website_url: '',
    instagram_handle: '',
    years_experience: 0,
    styles: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        location: profile.location || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        instagram_handle: profile.instagram_handle || '',
        years_experience: profile.years_experience || 0,
        styles: profile.styles?.join(', ') || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      const stylesArray = formData.styles.split(',').map(s => s.trim()).filter(s => s.length > 0);

      const updates: any = {
        id: user.id,
        display_name: formData.display_name,
        location: formData.location,
        bio: formData.bio,
        updated_at: new Date(),
      };

      if (profile?.role === UserRole.ARTIST) {
        updates.website_url = formData.website_url;
        updates.instagram_handle = formData.instagram_handle;
        updates.years_experience = formData.years_experience;
        updates.styles = stylesArray;
      }

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      // Reload page or re-fetch profile would be ideal here, but simpler to just show success
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Profile</h2>
        
        {message && (
          <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-900/50 text-green-200 border border-green-800' : 'bg-red-900/50 text-red-200 border border-red-800'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
            <input
              type="text"
              value={formData.display_name}
              onChange={(e) => setFormData({...formData, display_name: e.target.value})}
              className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="City, State"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({...formData, bio: e.target.value})}
              rows={4}
              className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {profile?.role === UserRole.ARTIST && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Instagram Handle</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-ink-700 bg-ink-800 text-gray-400 sm:text-sm">@</span>
                      <input
                        type="text"
                        value={formData.instagram_handle}
                        onChange={(e) => setFormData({...formData, instagram_handle: e.target.value})}
                        className="flex-1 min-w-0 block w-full px-3 py-3 rounded-none rounded-r-md bg-ink-950 border border-ink-700 text-white focus:ring-brand focus:border-brand sm:text-sm"
                      />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Website</label>
                     <input
                        type="text"
                        value={formData.website_url}
                        onChange={(e) => setFormData({...formData, website_url: e.target.value})}
                        className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
                        placeholder="https://"
                      />
                  </div>
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Styles (comma separated)</label>
                <input
                  type="text"
                  value={formData.styles}
                  onChange={(e) => setFormData({...formData, styles: e.target.value})}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
                  placeholder="Realism, Blackwork, Traditional..."
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Years of Experience</label>
                <input
                  type="number"
                  value={formData.years_experience}
                  onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value)})}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-ink-800 mt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-transparent text-gray-400 hover:text-white font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover font-medium flex items-center"
            >
              {loading && <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;