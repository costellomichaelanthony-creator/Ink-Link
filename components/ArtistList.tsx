import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Profile, TattooStyle } from '../types';

const PAGE_SIZE = 12;

const ArtistList: React.FC = () => {
  const [artists, setArtists] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [minExp, setMinExp] = useState<number | ''>('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  
  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Reset list when filters change
    setArtists([]);
    setPage(0);
    setHasMore(true);
    fetchArtists(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, locationFilter, minExp, selectedStyles]);

  const fetchArtists = async (pageNumber: number, isNewFilter: boolean) => {
    try {
      setLoading(true);
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('role', 'ARTIST')
        .range(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE - 1);

      if (debouncedSearch) {
        query = query.or(`display_name.ilike.%${debouncedSearch}%,bio.ilike.%${debouncedSearch}%`);
      }

      if (locationFilter) {
        query = query.ilike('location', `%${locationFilter}%`);
      }

      if (minExp !== '') {
        query = query.gte('years_experience', minExp);
      }

      if (selectedStyles.length > 0) {
        query = query.contains('styles', selectedStyles);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      if (data) {
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setArtists(prev => isNewFilter ? data : [...prev, ...data]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArtists(nextPage, false);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-3xl font-bold text-white mb-8">Find Your Artist</h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4 space-y-6">
          {/* Search */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
            <h3 className="text-white font-medium mb-3">Search</h3>
            <div className="relative">
              <i className="fa-solid fa-search absolute left-3 top-3 text-gray-500"></i>
              <input 
                type="text" 
                placeholder="Name or bio..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
            <h3 className="text-white font-medium mb-3">Location</h3>
            <div className="relative">
              <i className="fa-solid fa-location-dot absolute left-3 top-3 text-gray-500"></i>
              <input 
                type="text" 
                placeholder="City..." 
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Experience */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
             <h3 className="text-white font-medium mb-3">Min. Experience</h3>
             <div className="flex items-center gap-3">
               <input 
                  type="number"
                  min="0"
                  value={minExp}
                  onChange={(e) => setMinExp(e.target.value ? parseInt(e.target.value) : '')}
                  className="w-20 bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
               />
               <span className="text-gray-400 text-sm">years</span>
             </div>
          </div>

          {/* Styles */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
             <h3 className="text-white font-medium mb-3">Styles</h3>
             <div className="flex flex-wrap gap-2">
               {Object.values(TattooStyle).map(style => (
                 <button
                   key={style}
                   onClick={() => toggleStyle(style)}
                   className={`text-xs px-2 py-1 rounded border transition-colors ${
                     selectedStyles.includes(style)
                       ? 'bg-brand text-white border-brand'
                       : 'bg-ink-950 text-gray-400 border-ink-700 hover:border-gray-500'
                   }`}
                 >
                   {style}
                 </button>
               ))}
             </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="lg:w-3/4">
          {artists.length === 0 && !loading ? (
            <div className="text-center py-20 bg-ink-900 rounded-xl border border-dashed border-ink-800">
              <i className="fa-solid fa-user-slash text-4xl text-ink-700 mb-4"></i>
              <p className="text-gray-500">No artists found matching your criteria.</p>
              <button 
                onClick={() => {
                   setSearchQuery('');
                   setLocationFilter('');
                   setMinExp('');
                   setSelectedStyles([]);
                }}
                className="mt-4 text-brand hover:underline"
              >
                Clear Filters
              </button>
            </div>
          ) : (
             <div className="space-y-4">
              {artists.map((artist) => (
                <div key={artist.id} className="bg-ink-900 rounded-xl p-4 sm:p-6 border border-ink-800 flex flex-col sm:flex-row items-center gap-6 hover:border-brand/50 transition-colors">
                  <div className="flex-shrink-0">
                    {artist.avatar_url ? (
                      <img src={artist.avatar_url} alt={artist.display_name} className="w-24 h-24 rounded-full object-cover border-2 border-brand" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-ink-800 border-2 border-ink-700 flex items-center justify-center text-3xl font-bold text-gray-500">
                        {artist.display_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 text-center sm:text-left w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-xl font-bold text-white">{artist.display_name}</h3>
                      {artist.years_experience !== undefined && artist.years_experience > 0 && (
                         <span className="text-xs bg-ink-950 text-brand-accent px-2 py-1 rounded border border-ink-800 mt-2 sm:mt-0 w-fit mx-auto sm:mx-0">
                           {artist.years_experience} Years Exp.
                         </span>
                      )}
                    </div>
                    
                    {artist.location && (
                      <p className="text-gray-400 text-sm mt-1">
                        <i className="fa-solid fa-location-dot mr-1"></i> {artist.location}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                      {artist.styles && artist.styles.slice(0, 4).map(spec => (
                        <span key={spec} className="px-2 py-1 bg-ink-950 text-gray-300 text-xs rounded border border-ink-800">
                          {spec}
                        </span>
                      ))}
                      {artist.styles && artist.styles.length > 4 && (
                        <span className="text-xs text-gray-500 py-1">+ {artist.styles.length - 4} more</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                    <button className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium">
                      Book
                    </button>
                    <Link to={`/artists/${artist.id}`} className="px-6 py-2 bg-transparent border border-ink-700 text-gray-300 rounded-lg hover:bg-ink-800 transition-colors text-center">
                      Profile
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && artists.length > 0 && (
            <div className="mt-8 text-center">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-3 bg-ink-800 text-gray-300 rounded-lg hover:bg-ink-700 transition-colors"
              >
                Load More Artists
              </button>
            </div>
          )}
          
          {loading && (
             <div className="flex justify-center py-12">
               <div className="text-brand text-xl"><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistList;