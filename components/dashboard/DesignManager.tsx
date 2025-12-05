import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { MarketplaceDesign } from '../../types';
import { useAuth } from '../../context/AuthContext';

const DesignManager: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<MarketplaceDesign[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('designs')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching designs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !user) return;
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_flash.${fileExt}`;
      const filePath = `designs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('designs').insert({
        artist_id: user.id,
        title,
        price_cents: Math.round(parseFloat(price) * 100) || 0, // Convert to cents
        image_url: publicUrl,
        style_tags: [],
        is_available: true
      });

      if (dbError) throw dbError;

      setTitle('');
      setPrice('');
      setFile(null);
      fetchItems();
    } catch (error: any) {
      alert('Error uploading: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const toggleAvailability = async (id: string, currentStatus: boolean) => {
    try {
       const { error } = await supabase
        .from('designs')
        .update({ is_available: !currentStatus })
        .eq('id', id);
        
       if (error) throw error;
       fetchItems();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Flash Marketplace Manager</h3>

      <form onSubmit={handleUpload} className="mb-8 bg-ink-950 p-4 rounded-lg border border-ink-800">
        <h4 className="text-md font-medium text-gray-300 mb-4">Add New Flash for Sale</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Design Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-white text-sm"
            />
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                placeholder="Price (USD)"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-ink-900 border border-ink-700 rounded p-2 pl-6 text-white text-sm"
              />
            </div>
          </div>
          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand-hover"
            />
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2 bg-brand text-white rounded hover:bg-brand-hover disabled:opacity-50"
            >
              {uploading ? 'Publishing...' : 'Publish to Marketplace'}
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No designs for sale yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-ink-950 rounded-lg overflow-hidden border border-ink-800 flex flex-row sm:flex-col h-full">
              <img src={item.image_url} alt={item.title} className="w-24 sm:w-full h-full sm:h-40 object-cover" />
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                   <div className="flex justify-between items-start">
                      <p className="text-white font-medium truncate">{item.title}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${item.is_available ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                        {item.is_available ? 'Active' : 'Hidden'}
                      </span>
                   </div>
                   <p className="text-brand font-bold mt-1">${(item.price_cents / 100).toFixed(2)}</p>
                </div>
                
                <button
                  onClick={() => toggleAvailability(item.id, item.is_available)}
                  className="mt-3 w-full py-1 text-xs border border-ink-700 text-gray-400 rounded hover:bg-ink-800 hover:text-white transition-colors"
                >
                  {item.is_available ? 'Unlist' : 'Relist'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DesignManager;