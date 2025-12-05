import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarketplaceDesign, TattooStyle } from '../types';

const PAGE_SIZE = 12;

type SortOption = 'newest' | 'price_asc' | 'price_desc';

const Marketplace: React.FC = () => {
  const [designs, setDesigns] = useState<MarketplaceDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [priceMin, setPriceMin] = useState<number | ''>('');
  const [priceMax, setPriceMax] = useState<number | ''>('');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setDesigns([]);
    setPage(0);
    setHasMore(true);
    fetchDesigns(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedStyle, priceMin, priceMax, sortOption]);

  const fetchDesigns = async (pageNumber: number, isNewFilter: boolean) => {
    try {
      setLoading(true);
      let query = supabase
        .from('designs')
        .select(`
            *,
            artist:profiles(display_name)
          `)
        .eq('is_available', true)
        .range(pageNumber * PAGE_SIZE, (pageNumber + 1) * PAGE_SIZE - 1);

      if (debouncedSearch) {
        query = query.or(`title.ilike.%${debouncedSearch}%,description.ilike.%${debouncedSearch}%`);
      }

      if (selectedStyle) {
        query = query.contains('style_tags', [selectedStyle]);
      }

      if (priceMin !== '') {
        query = query.gte('price_cents', priceMin * 100);
      }

      if (priceMax !== '') {
        query = query.lte('price_cents', priceMax * 100);
      }

      // Sorting
      if (sortOption === 'newest') {
        query = query.order('created_at', { ascending: false });
      } else if (sortOption === 'price_asc') {
        query = query.order('price_cents', { ascending: true });
      } else if (sortOption === 'price_desc') {
        query = query.order('price_cents', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data) {
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setDesigns(prev => isNewFilter ? data : [...prev, ...data]);
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
    fetchDesigns(nextPage, false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Flash Marketplace</h2>
            <p className="text-gray-400 mt-1">Exclusive designs ready for ink.</p>
        </div>
      </div>

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
                placeholder="Keywords..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded-lg pl-10 pr-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          {/* Sort */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
             <h3 className="text-white font-medium mb-3">Sort By</h3>
             <select 
               value={sortOption}
               onChange={(e) => setSortOption(e.target.value as SortOption)}
               className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
             >
               <option value="newest">Newest Arrivals</option>
               <option value="price_asc">Price: Low to High</option>
               <option value="price_desc">Price: High to Low</option>
             </select>
          </div>

          {/* Price */}
          <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
             <h3 className="text-white font-medium mb-3">Price Range ($)</h3>
             <div className="flex items-center gap-2">
               <input 
                  type="number"
                  placeholder="Min"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
               />
               <span className="text-gray-500">-</span>
               <input 
                  type="number"
                  placeholder="Max"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value ? parseFloat(e.target.value) : '')}
                  className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
               />
             </div>
          </div>

           {/* Style */}
           <div className="bg-ink-900 p-4 rounded-xl border border-ink-800">
             <h3 className="text-white font-medium mb-3">Style</h3>
             <select 
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-ink-950 border border-ink-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand"
             >
                <option value="">All Styles</option>
                {Object.values(TattooStyle).map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
             </select>
          </div>
        </div>

        {/* Results */}
        <div className="lg:w-3/4">
          {designs.length === 0 && !loading ? (
             <div className="text-gray-500 text-center py-20 border border-dashed border-ink-800 rounded-xl bg-ink-900">
               No designs match your filters.
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <Link key={design.id} to={`/designs/${design.id}`} className="group">
                  <div className="bg-ink-900 rounded-xl border border-ink-800 overflow-hidden hover:shadow-xl hover:shadow-brand/5 transition-all">
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-800 relative">
                      <img
                        src={design.image_url}
                        alt={design.title}
                        className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2 bg-ink-950/80 backdrop-blur px-2 py-1 rounded text-xs text-white">
                        ${(design.price_cents / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-white group-hover:text-brand transition-colors truncate">{design.title}</h3>
                      <p className="text-sm text-gray-400 mb-4 truncate">by {design.artist?.display_name || 'Unknown'}</p>
                      <button className="w-full py-2 bg-ink-800 text-white rounded-lg group-hover:bg-brand transition-colors flex items-center justify-center gap-2">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

           {/* Load More */}
           {hasMore && !loading && designs.length > 0 && (
            <div className="mt-8 text-center">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-3 bg-ink-800 text-gray-300 rounded-lg hover:bg-ink-700 transition-colors"
              >
                Load More Designs
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

export default Marketplace;