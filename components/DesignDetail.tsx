
import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { MarketplaceDesign } from '../types';
import { useAuth } from '../context/AuthContext';
import { createDesignCheckoutSession } from '../services/stripeService';

const DesignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const success = searchParams.get('success');
  const { user } = useAuth();
  
  const [design, setDesign] = useState<MarketplaceDesign | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchDesign = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('designs')
          .select(`
            *,
            artist:profiles(id, display_name, avatar_url)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setDesign(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesign();
  }, [id]);

  const handleBuy = async () => {
      if (!user) {
        alert("Please log in to purchase.");
        return;
      }
      if (!design) return;

      setPurchasing(true);
      try {
        await createDesignCheckoutSession(design.id, user.id);
      } catch (error: any) {
        alert(error.message || "Payment initialization failed");
        setPurchasing(false);
      }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!design) return <div className="text-center py-20 text-red-500">Design not found.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link to="/marketplace" className="text-gray-400 hover:text-white mb-8 inline-block">
        <i className="fa-solid fa-arrow-left mr-2"></i> Back to Marketplace
      </Link>
      
      {success === 'true' && (
        <div className="bg-green-900/50 border border-green-800 text-green-200 p-4 rounded-xl mb-8 flex items-center gap-3">
          <i className="fa-solid fa-check-circle text-xl"></i>
          <div>
            <p className="font-bold">Purchase Successful!</p>
            <p className="text-sm">You can now download your design from your dashboard.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-ink-900 rounded-xl overflow-hidden border border-ink-800 relative">
             <img src={design.image_url} alt={design.title} className={`w-full h-auto object-contain max-h-[600px] bg-black ${!design.is_available && success !== 'true' ? 'opacity-50 grayscale' : ''}`} />
             {!design.is_available && success !== 'true' && (
               <div className="absolute inset-0 flex items-center justify-center">
                 <div className="bg-red-600 text-white px-6 py-2 rounded-full font-bold transform -rotate-12 border-2 border-white shadow-xl text-xl">
                   SOLD
                 </div>
               </div>
             )}
        </div>
        
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-extrabold text-white mb-2">{design.title}</h1>
                <Link to={`/artists/${design.artist?.id}`} className="text-brand hover:text-brand-hover text-lg font-medium flex items-center gap-2">
                   {design.artist?.avatar_url && <img src={design.artist.avatar_url} className="w-6 h-6 rounded-full" />}
                   by {design.artist?.display_name || 'Unknown Artist'}
                </Link>
            </div>

            <div className="bg-ink-900 p-6 rounded-xl border border-ink-800">
                <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-400">Price (One-time license)</span>
                    <span className="text-3xl font-bold text-white">${(design.price_cents / 100).toFixed(2)}</span>
                </div>
                
                {design.is_available ? (
                  <button 
                      onClick={handleBuy}
                      disabled={purchasing}
                      className="w-full py-4 bg-brand text-white font-bold rounded-lg hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all text-lg flex items-center justify-center"
                  >
                      {purchasing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Buy Now'}
                  </button>
                ) : (
                   <button 
                      disabled
                      className="w-full py-4 bg-ink-800 text-gray-400 font-bold rounded-lg cursor-not-allowed"
                  >
                      Unavailable
                  </button>
                )}

                <p className="text-center text-xs text-gray-500 mt-3">
                    <i className="fa-solid fa-lock mr-1"></i> Secure checkout via Stripe
                </p>
            </div>

            <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Description</h3>
                <p className="text-gray-300 leading-relaxed">
                    {design.description || "No description provided for this design."}
                </p>
            </div>
            
            <div className="space-y-4">
                 <h3 className="text-xl font-bold text-white">License Details</h3>
                 <ul className="list-disc list-inside text-gray-400 space-y-2">
                     <li>High-resolution digital download</li>
                     <li>Permission to tattoo once by any artist</li>
                     <li>Artist retains copyright</li>
                 </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DesignDetail;
