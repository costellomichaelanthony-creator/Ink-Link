import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Profile, PortfolioItem } from '../types';

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Profile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // Fetch Artist
        const { data: artistData, error: artistError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
        
        if (artistError) throw artistError;
        setArtist(artistData);

        // Fetch Portfolio
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('portfolio_items')
          .select('*')
          .eq('artist_id', id)
          .order('created_at', { ascending: false });

        if (portfolioError) throw portfolioError;
        setPortfolio(portfolioData || []);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading profile...</div>;
  if (!artist) return <div className="text-center py-20 text-red-500">Artist not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Profile Header */}
      <div className="bg-ink-900 rounded-2xl border border-ink-800 p-8 mb-12 flex flex-col md:flex-row gap-8 items-start">
         <div className="flex-shrink-0">
            {artist.avatar_url ? (
                <img src={artist.avatar_url} alt={artist.display_name} className="w-32 h-32 rounded-full object-cover border-4 border-ink-800 shadow-xl" />
            ) : (
                <div className="w-32 h-32 rounded-full bg-ink-800 border-4 border-ink-700 flex items-center justify-center text-4xl font-bold text-gray-500">
                    {artist.display_name.charAt(0)}
                </div>
            )}
         </div>
         <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{artist.display_name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-4">
                {artist.location && <span><i className="fa-solid fa-location-dot mr-1"></i> {artist.location}</span>}
                {artist.instagram_handle && <span><i className="fa-brands fa-instagram mr-1"></i> {artist.instagram_handle}</span>}
                {artist.years_experience && <span><i className="fa-solid fa-clock mr-1"></i> {artist.years_experience} Years Exp.</span>}
            </div>
            {artist.styles && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {artist.styles.map(style => (
                        <span key={style} className="px-2 py-1 bg-brand/10 text-brand-accent rounded text-xs border border-brand/20">
                            {style}
                        </span>
                    ))}
                </div>
            )}
            <p className="text-gray-300 leading-relaxed max-w-2xl">{artist.bio || "No bio available."}</p>
         </div>
         <div className="flex flex-col gap-3">
             <Link 
               to={`/bookings/request?artistId=${artist.id}`}
               className="px-8 py-3 bg-brand text-white rounded-lg hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all font-bold text-center"
             >
                 Book Appointment
             </Link>
             {artist.website_url && (
                <a href={artist.website_url} target="_blank" rel="noreferrer" className="px-8 py-3 bg-ink-950 border border-ink-700 text-gray-300 rounded-lg hover:bg-ink-800 text-center transition-all">
                    Visit Website
                </a>
             )}
         </div>
      </div>

      {/* Portfolio Grid */}
      <h2 className="text-2xl font-bold text-white mb-6">Portfolio</h2>
      {portfolio.length === 0 ? (
          <div className="text-gray-500 italic">This artist hasn't uploaded any work yet.</div>
      ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {portfolio.map(item => (
                  <div key={item.id} className="break-inside-avoid bg-ink-900 rounded-xl overflow-hidden border border-ink-800 group hover:border-brand/50 transition-colors">
                      <img src={item.image_url} alt={item.title} className="w-full h-auto" />
                      <div className="p-4">
                          <h3 className="font-bold text-white">{item.title}</h3>
                          {item.description && <p className="text-sm text-gray-400 mt-1">{item.description}</p>}
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );
};

export default ArtistProfile;