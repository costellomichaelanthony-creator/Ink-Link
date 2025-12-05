
import React, { useState } from 'react';
import { TattooStyle, DesignConcept } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../services/supabase';

interface Props {
  onConceptCreated: (concept: DesignConcept) => void;
}

const ConceptGenerator: React.FC<Props> = ({ onConceptCreated }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState<TattooStyle>(TattooStyle.BLACKWORK);
  const [placement, setPlacement] = useState('Forearm');
  const [loading, setLoading] = useState(false);
  const [currentConcept, setCurrentConcept] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

  const handleGenerate = async () => {
    if (!description) return;
    setLoading(true);
    setCurrentConcept(null);

    try {
      const response = await fetch('/api/design-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: description,
          style,
          placement
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      setCurrentConcept(data);
    } catch (error) {
      console.error('Generation failed', error);
      alert('Failed to generate concept.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !currentConcept) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('design_concepts')
        .insert({
          user_id: user.id,
          prompt: currentConcept.prompt_used,
          style: currentConcept.style,
          placement: currentConcept.placement,
          description_summary: currentConcept.description_summary,
          image_url: currentConcept.image_url
        })
        .select()
        .single();

      if (error) throw error;
      
      onConceptCreated(data as DesignConcept);
      alert('Concept saved to your library!');
    } catch (error: any) {
      console.error('Save failed', error);
      alert('Failed to save concept: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
      <h2 className="text-xl font-bold text-white mb-6">
        <i className="fa-solid fa-wand-magic-sparkles text-brand mr-2"></i>
        AI Concept Generator
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Describe your idea</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
            rows={3}
            placeholder="e.g. A geometric wolf head with floral accents..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Style</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as TattooStyle)}
              className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
            >
              {Object.values(TattooStyle).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Placement</label>
            <select
              value={placement}
              onChange={(e) => setPlacement(e.target.value)}
              className="w-full bg-ink-950 border border-ink-700 rounded-lg p-3 text-white focus:border-brand focus:outline-none"
            >
              <option value="Forearm">Forearm</option>
              <option value="Upper Arm">Upper Arm</option>
              <option value="Chest">Chest</option>
              <option value="Back">Back</option>
              <option value="Calf">Calf</option>
              <option value="Thigh">Thigh</option>
              <option value="Neck">Neck</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !description}
          className="w-full py-3 bg-brand text-white rounded-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
        >
          {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Generate Concept'}
        </button>
      </div>

      {currentConcept && (
        <div className="mt-8 border-t border-ink-800 pt-6 animate-fade-in">
          <div className="bg-ink-950 rounded-lg overflow-hidden border border-ink-800">
            <img src={currentConcept.image_url} alt="Generated Concept" className="w-full h-64 object-cover" />
            <div className="p-4">
              <h3 className="font-bold text-white text-lg">Generated Result</h3>
              <p className="text-gray-400 text-sm mt-1">{currentConcept.description_summary}</p>
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 bg-brand/10 text-brand rounded text-xs border border-brand/20">{currentConcept.style}</span>
                <span className="px-2 py-1 bg-ink-800 text-gray-300 rounded text-xs border border-ink-700">{currentConcept.placement}</span>
              </div>
              
              <button
                onClick={handleSave}
                disabled={saving || !user}
                className="mt-4 w-full py-2 border border-brand text-brand rounded-lg hover:bg-brand hover:text-white transition-colors flex items-center justify-center gap-2"
              >
                {saving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                {user ? 'Save to Library' : 'Login to Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConceptGenerator;
