import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { PortfolioItem } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PortfolioManager: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, [user]);

  const fetchItems = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('*')
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
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
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `portfolios/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('portfolio_items').insert({
        artist_id: user.id,
        title,
        description,
        image_url: publicUrl,
        style_tags: [], // Could add tag input later
      });

      if (dbError) throw dbError;

      // Reset form
      setTitle('');
      setDescription('');
      setFile(null);
      fetchItems();
    } catch (error: any) {
      alert('Error uploading: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      // Optimistically remove from UI
      setItems(items.filter(item => item.id !== id));
      
      await supabase.from('portfolio_items').delete().eq('id', id);
      // Note: We should technically also delete from storage, but for now we keep it simple
    } catch (error) {
      console.error('Error deleting:', error);
      fetchItems(); // Revert on error
    }
  };

  return (
    <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
      <h3 className="text-xl font-bold text-white mb-6">Portfolio Manager</h3>

      {/* Upload Form */}
      <form onSubmit={handleUpload} className="mb-8 bg-ink-950 p-4 rounded-lg border border-ink-800">
        <h4 className="text-md font-medium text-gray-300 mb-4">Add New Work</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-white text-sm"
            />
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-ink-900 border border-ink-700 rounded p-2 text-white text-sm"
              rows={3}
            />
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
              {uploading ? 'Uploading...' : 'Add to Portfolio'}
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No portfolio items yet.</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group bg-ink-950 rounded-lg overflow-hidden">
              <img src={item.image_url} alt={item.title} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(item.id, item.image_url)}
                  className="text-red-400 hover:text-red-300"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
              <div className="p-2">
                <p className="text-white text-xs truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;