import React, { useState } from 'react';
import { generateTattooDesign } from '../services/geminiService';
import { TattooStyle, GeneratedDesign } from '../types';

const DesignGenerator: React.FC = () => {
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<TattooStyle>(TattooStyle.BLACKWORK);
  const [placement, setPlacement] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedDesigns, setGeneratedDesigns] = useState<GeneratedDesign[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description || !placement) {
      setError("Please fill in all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await generateTattooDesign(description, style, placement);
      const newDesign: GeneratedDesign = {
        imageUrl,
        prompt: description,
        style,
        createdAt: new Date(),
      };
      setGeneratedDesigns(prev => [newDesign, ...prev]);
    } catch (err) {
      setError("Failed to generate design. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="md:flex md:gap-8">
        {/* Controls */}
        <div className="md:w-1/3 bg-ink-900 p-6 rounded-xl border border-ink-800 h-fit sticky top-24">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <i className="fa-solid fa-wand-magic-sparkles mr-3 text-brand"></i>
            AI Design Studio
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Concept Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. A wolf howling at a geometric moon with roses..."
                className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none h-32 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Style</label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as TattooStyle)}
                className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
              >
                {Object.values(TattooStyle).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Body Placement</label>
              <input
                type="text"
                value={placement}
                onChange={(e) => setPlacement(e.target.value)}
                placeholder="e.g. Inner forearm, left shoulder..."
                className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-800 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center ${
                isLoading 
                  ? 'bg-ink-700 cursor-not-allowed text-gray-400' 
                  : 'bg-brand hover:bg-brand-hover text-white shadow-lg shadow-brand/20'
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2"></i>
                  Designing...
                </>
              ) : (
                'Generate Tattoo'
              )}
            </button>
          </div>
        </div>

        {/* Output Gallery */}
        <div className="md:w-2/3 mt-8 md:mt-0">
           <h2 className="text-xl font-semibold text-gray-300 mb-4">Your Concepts</h2>
           
           {generatedDesigns.length === 0 ? (
             <div className="border-2 border-dashed border-ink-800 rounded-xl p-12 text-center text-gray-500 h-96 flex flex-col items-center justify-center">
               <i className="fa-solid fa-pen-nib text-4xl mb-4 text-ink-700"></i>
               <p>Your generated designs will appear here.</p>
               <p className="text-sm mt-2">Describe your idea to get started.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {generatedDesigns.map((design, idx) => (
                 <div key={idx} className="group relative bg-ink-900 rounded-xl overflow-hidden border border-ink-800 hover:border-brand transition-colors">
                   <img 
                     src={design.imageUrl} 
                     alt={design.prompt} 
                     className="w-full h-80 object-cover"
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                     <p className="text-white font-medium truncate">{design.prompt}</p>
                     <div className="flex justify-between items-center mt-2">
                       <span className="text-xs text-brand-accent bg-brand-accent/10 px-2 py-1 rounded">{design.style}</span>
                       <button className="text-white hover:text-brand">
                         <i className="fa-solid fa-download"></i>
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default DesignGenerator;