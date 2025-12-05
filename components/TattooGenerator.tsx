
import React, { useState } from "react";
import { generateTattooDesign } from "../services/geminiService";
import { TattooStyle } from "../types";

const TattooGenerator: React.FC = () => {
  const [description, setDescription] = useState("");
  const [style, setStyle] = useState<TattooStyle>("traditional");
  const [placement, setPlacement] = useState("forearm");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setLoading(true);
    setError(null);
    setImage(null);

    try {
      const img = await generateTattooDesign(description, style, placement);
      setImage(img);
    } catch (e: any) {
      console.error(e);
      setError(e?.message ?? "Something went wrong generating the tattoo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold">AI Tattoo Generator</h2>

      <textarea
        className="w-full border rounded p-2"
        placeholder="Describe your tattoo idea…"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      <div className="flex gap-2">
        <select
          className="border rounded p-2 flex-1"
          value={style}
          onChange={(e) => setStyle(e.target.value as TattooStyle)}
        >
          <option value="traditional">Traditional</option>
          <option value="fine_line">Fine line</option>
          <option value="blackwork">Blackwork</option>
          <option value="japanese">Japanese</option>
          {/* add more that match your TattooStyle type */}
        </select>

        <input
          className="border rounded p-2 flex-1"
          placeholder="Placement (e.g. forearm)"
          value={placement}
          onChange={(e) => setPlacement(e.target.value)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="border rounded px-4 py-2"
      >
        {loading ? "Generating…" : "Generate tattoo"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {image && (
        <div className="mt-4">
          <img
            src={image}
            alt="Generated tattoo design"
            className="max-w-full border rounded"
          />
        </div>
      )}
    </div>
  );
};

export default TattooGenerator;
