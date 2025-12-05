
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ConceptGenerator from './ConceptGenerator';
import VirtualTryOn from './VirtualTryOn';
import { supabase } from '../../services/supabase';
import { DesignConcept } from '../../types';

const DesignLab: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'generate' | 'try-on'>('generate');
  const [savedConcepts, setSavedConcepts] = useState<DesignConcept[]>([]);

  useEffect(() => {
    if (user) {
      fetchConcepts();
    }
  }, [user]);

  const fetchConcepts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('design_concepts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setSavedConcepts(data as DesignConcept[]);
  };

  const handleConceptCreated = (newConcept: DesignConcept) => {
    setSavedConcepts([newConcept, ...savedConcepts]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Design Lab</h1>
        <p className="text-gray-400 mt-2">Generate concepts with AI and visualize them on your body.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-800 mb-8">
        <button
          onClick={() => setActiveTab('generate')}
          className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'generate' 
              ? 'border-brand text-brand' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
          Generate Concept
        </button>
        <button
          onClick={() => setActiveTab('try-on')}
          className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'try-on' 
              ? 'border-brand text-brand' 
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <i className="fa-solid fa-layer-group mr-2"></i>
          Virtual Try-On
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === 'generate' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ConceptGenerator onConceptCreated={handleConceptCreated} />
            
            <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
               <h3 className="text-white font-bold mb-4">Your Saved Concepts</h3>
               {savedConcepts.length === 0 ? (
                 <p className="text-gray-500 text-sm">No saved concepts yet.</p>
               ) : (
                 <div className="grid grid-cols-2 gap-4">
                   {savedConcepts.slice(0, 4).map(concept => (
                     <div key={concept.id} className="relative group rounded-lg overflow-hidden border border-ink-800">
                        <img src={concept.image_url} className="w-full h-32 object-cover" alt="Concept" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity p-2 text-center">
                          <p className="text-white text-xs">{concept.prompt}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        ) : (
          <VirtualTryOn savedConcepts={savedConcepts} />
        )}
      </div>
    </div>
  );
};

export default DesignLab;
