import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import VirtualTryOn from "./VirtualTryOn";
import { supabase } from "../../services/supabase";
import { DesignConcept, TattooStyle } from "../../types";
import { generateTattooDesign } from "../../services/geminiService";

const generateLocalId = () =>
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const DesignLab: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"generate" | "try-on">("generate");
  const [savedConcepts, setSavedConcepts] = useState<DesignConcept[]>([]);

  // Generator form state
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<TattooStyle>("traditional");
  const [placement, setPlacement] = useState("forearm");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchConcepts();
    }
  }, [user]);

  const fetchConcepts = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("design_concepts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Failed to load design concepts from Supabase:", error.message);
      return;
    }

    if (data) setSavedConcepts(data as DesignConcept[]);
  };

  const handleGenerateConcept = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // 1) Call Imagen / Gemini to get a tattoo design
      const imageDataUrl = await generateTattooDesign(prompt, style, placement);

      // 2) Try to save to Supabase if user logged in
      if (user) {
        const { data, error } = await supabase
          .from("design_concepts")
          .insert({
            user_id: user.id,
            prompt,
            image_url: imageDataUrl,
          })
          .select()
          .single();

        if (!error && data) {
          setSavedConcepts((prev) => [data as DesignConcept, ...prev]);
        } else {
          console.warn("Supabase insert failed, using local concept only:", error?.message);
          const localConcept = {
  id: generateLocalId(),
  prompt,
  image_url: imageDataUrl,
  created_at: new Date().toISOString(),
  user_id: user.id,
} as unknown as DesignConcept;

          setSavedConcepts((prev) => [localConcept, ...prev]);
        }
      } else {
        // 3) No user → keep it local only
        const localConcept = {
  id: generateLocalId(),
  prompt,
  image_url: imageDataUrl,
  created_at: new Date().toISOString(),
  user_id: null,
} as unknown as DesignConcept;

        setSavedConcepts((prev) => [localConcept, ...prev]);
      }

      // Optional: clear prompt after success
      // setPrompt("");
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Failed to generate tattoo concept.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Design Lab</h1>
        <p className="text-gray-400 mt-2">
          Generate concepts with AI and visualize them on your body.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-ink-800 mb-8">
        <button
          onClick={() => setActiveTab("generate")}
          className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "generate"
              ? "border-brand text-brand"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-wand-magic-sparkles mr-2" />
          Generate Concept
        </button>
        <button
          onClick={() => setActiveTab("try-on")}
          className={`pb-4 px-6 text-sm font-medium transition-colors border-b-2 ${
            activeTab === "try-on"
              ? "border-brand text-brand"
              : "border-transparent text-gray-400 hover:text-white"
          }`}
        >
          <i className="fa-solid fa-layer-group mr-2" />
          Virtual Try-On
        </button>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {activeTab === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT: AI generator */}
            <div className="bg-ink-900 rounded-xl border border-ink-800 p-6 space-y-4">
              <h3 className="text-white font-bold text-lg mb-2">
                AI Tattoo Concept Generator
              </h3>
              <p className="text-sm text-gray-400 mb-2">
                Describe your idea, choose a style, and Ink Link will generate a
                tattoo concept for you.
              </p>

              <textarea
                className="w-full bg-ink-950 border border-ink-800 rounded-md p-3 text-sm text-gray-100"
                rows={4}
                placeholder="e.g. A fine-line dragon wrapping around the forearm with subtle floral elements"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  className="flex-1 bg-ink-950 border border-ink-800 rounded-md p-2 text-sm"
                  value={style}
                  onChange={(e) => setStyle(e.target.value as TattooStyle)}
                >
                  <option value="traditional">Traditional</option>
                  <option value="fine_line">Fine line</option>
                  <option value="blackwork">Blackwork</option>
                  <option value="japanese">Japanese</option>
                  {/* add any others you defined in TattooStyle */}
                </select>

                <input
                  className="flex-1 bg-ink-950 border border-ink-800 rounded-md p-2 text-sm"
                  placeholder="Placement (e.g. forearm, shoulder, calf)"
                  value={placement}
                  onChange={(e) => setPlacement(e.target.value)}
                />
              </div>

              <button
                onClick={handleGenerateConcept}
                disabled={loading || !prompt.trim()}
                className="w-full bg-brand hover:bg-brand/90 disabled:bg-ink-800 disabled:text-gray-500 rounded-md py-2 text-sm font-semibold mt-1"
              >
                {loading ? "Generating concept…" : "Generate concept"}
              </button>

              {error && (
                <p className="text-xs text-red-400 mt-2">
                  {error}
                </p>
              )}
            </div>

            {/* RIGHT: saved concepts */}
            <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
              <h3 className="text-white font-bold mb-4">Your Saved Concepts</h3>
              {savedConcepts.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No saved concepts yet. Generate a concept to get started.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {savedConcepts.slice(0, 6).map((concept) => (
                    <div
                      key={concept.id}
                      className="relative group rounded-lg overflow-hidden border border-ink-800"
                    >
                      <img
                        src={concept.image_url}
                        className="w-full h-48 object-contain bg-ink-950 p-2 rounded"
                        loading="lazy"
                      />
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
