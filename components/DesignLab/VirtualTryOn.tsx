
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';
import { DesignConcept } from '../../types';

interface Props {
  savedConcepts: DesignConcept[];
}

const VirtualTryOn: React.FC<Props> = ({ savedConcepts }) => {
  const { user } = useAuth();
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [overlayImage, setOverlayImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Transform State
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0.9);
  const [posX, setPosX] = useState(50); // percentage
  const [posY, setPosY] = useState(50); // percentage

  const handleBodyUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return;
    const file = e.target.files[0];
    
    // For preview, we can just use local object URL to be fast
    const objectUrl = URL.createObjectURL(file);
    setBodyImage(objectUrl);
    
    // In background, could upload to Supabase if we want to save the "session"
  };

  const handleSavePreview = async () => {
    if (!user || !bodyImage || !overlayImage) return;
    setUploading(true);
    
    try {
      // Logic to actually save would involve uploading the body image blob to Supabase Storage
      // and then saving the record to 'design_previews'.
      // For this stub, we'll just simulate a save.
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Preview saved successfully!");
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Controls Sidebar */}
      <div className="lg:w-1/3 space-y-6">
        {/* Step 1: Upload Body */}
        <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
          <h3 className="font-bold text-white mb-4">1. Upload Body Photo</h3>
          <label className="block w-full cursor-pointer bg-ink-950 border-2 border-dashed border-ink-700 rounded-lg p-6 text-center hover:border-brand transition-colors">
             <i className="fa-solid fa-camera text-2xl text-gray-400 mb-2"></i>
             <p className="text-sm text-gray-400">Click to upload photo</p>
             <input type="file" accept="image/*" className="hidden" onChange={handleBodyUpload} />
          </label>
        </div>

        {/* Step 2: Select Tattoo */}
        <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
          <h3 className="font-bold text-white mb-4">2. Select Design</h3>
          {savedConcepts.length === 0 ? (
            <p className="text-gray-500 text-sm">Generate and save concepts first.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
              {savedConcepts.map(concept => (
                <button 
                  key={concept.id}
                  onClick={() => setOverlayImage(concept.image_url)}
                  className={`border-2 rounded-lg overflow-hidden h-20 ${overlayImage === concept.image_url ? 'border-brand' : 'border-transparent'}`}
                >
                  <img src={concept.image_url} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          
           <div className="mt-4 pt-4 border-t border-ink-800">
              <p className="text-xs text-gray-400 mb-2">Or paste URL:</p>
              <input 
                type="text" 
                placeholder="https://..." 
                className="w-full bg-ink-950 border border-ink-700 rounded px-2 py-1 text-xs text-white"
                onChange={(e) => setOverlayImage(e.target.value)}
              />
           </div>
        </div>

        {/* Step 3: Adjust */}
        {overlayImage && (
          <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
             <h3 className="font-bold text-white mb-4">3. Adjust Placement</h3>
             
             <div className="space-y-4">
                <div>
                  <label className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Scale</span> <span>{scale.toFixed(1)}x</span>
                  </label>
                  <input type="range" min="0.1" max="3" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-full accent-brand" />
                </div>
                <div>
                  <label className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Rotation</span> <span>{rotation}°</span>
                  </label>
                  <input type="range" min="0" max="360" value={rotation} onChange={(e) => setRotation(parseInt(e.target.value))} className="w-full accent-brand" />
                </div>
                 <div>
                  <label className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Opacity</span> <span>{Math.round(opacity * 100)}%</span>
                  </label>
                  <input type="range" min="0.1" max="1" step="0.1" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full accent-brand" />
                </div>
                <div>
                   <label className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Position X/Y</span>
                  </label>
                   <div className="grid grid-cols-2 gap-2">
                      <input type="range" min="0" max="100" value={posX} onChange={(e) => setPosX(parseInt(e.target.value))} className="w-full accent-brand" />
                      <input type="range" min="0" max="100" value={posY} onChange={(e) => setPosY(parseInt(e.target.value))} className="w-full accent-brand" />
                   </div>
                </div>
             </div>
          </div>
        )}
        
        <button 
           onClick={handleSavePreview}
           disabled={!user || !bodyImage || uploading}
           className="w-full py-3 bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50"
        >
          {uploading ? 'Saving...' : 'Save Preview'}
        </button>
      </div>

      {/* Canvas Area */}
      <div className="lg:w-2/3 bg-black rounded-xl border border-ink-800 overflow-hidden relative min-h-[500px] flex items-center justify-center">
         {!bodyImage ? (
           <div className="text-gray-600 text-center">
             <i className="fa-solid fa-image text-4xl mb-4"></i>
             <p>Upload a body photo to start</p>
           </div>
         ) : (
           <div className="relative w-full h-full overflow-hidden">
             <img src={bodyImage} alt="Body" className="w-full h-full object-contain pointer-events-none select-none" />
             
             {overlayImage && (
               <div 
                 className="absolute w-48 h-48 cursor-move"
                 style={{
                   left: `${posX}%`,
                   top: `${posY}%`,
                   transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`,
                   opacity: opacity,
                   mixBlendMode: 'multiply' // Helps tattoo look realistic on skin
                 }}
               >
                 <img src={overlayImage} alt="Tattoo Overlay" className="w-full h-full object-contain drop-shadow-xl" />
               </div>
             )}
           </div>
         )}
         
         <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded text-xs text-gray-300 pointer-events-none">
           Virtual Try-On Preview
         </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
