import React, { useRef, useState } from "react";
import { DesignConcept } from "../../types";

interface VirtualTryOnProps {
  savedConcepts: DesignConcept[];
}

// Utility: turn nearly-white pixels transparent
const stripWhiteBackground = (src: string): Promise<string> =>
  new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(src);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Any pixel that's very close to white → alpha = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // tweak 240 threshold if needed (lower = more aggressive)
        if (r > 240 && g > 240 && b > 240) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });

const VirtualTryOn: React.FC<VirtualTryOnProps> = ({ savedConcepts }) => {
  const [bodyImage, setBodyImage] = useState<string | null>(null);
  const [selectedConcept, setSelectedConcept] = useState<DesignConcept | null>(
    null
  );
  const [overlaySrc, setOverlaySrc] = useState<string | null>(null);

  // tattoo controls
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [opacity, setOpacity] = useState(0.8);
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 }); // relative (0–1)

  const [isDragging, setIsDragging] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

  const handleBodyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setBodyImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectConcept = async (concept: DesignConcept) => {
    setSelectedConcept(concept);
    setScale(1);
    setRotation(0);
    setOpacity(0.8);
    setPosition({ x: 0.5, y: 0.5 });

    // generate transparent version of the tattoo
    const cleaned = await stripWhiteBackground(concept.image_url);
    setOverlaySrc(cleaned);
  };

  const handleMouseDownTattoo = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePositionFromPoint = (clientX: number, clientY: number) => {
    if (!previewRef.current) return;

    const bounds = previewRef.current.getBoundingClientRect();
    const x = (clientX - bounds.left) / bounds.width;
    const y = (clientY - bounds.top) / bounds.height;

    setPosition({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!isDragging) return;
    updatePositionFromPoint(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    updatePositionFromPoint(touch.clientX, touch.clientY);
  };

  const currentOverlay = overlaySrc || selectedConcept?.image_url || null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* 1. Upload body photo */}
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
        <h3 className="text-white font-bold mb-3">1. Upload Body Photo</h3>
        <p className="text-sm text-gray-400 mb-4">
          Upload a clear photo of the area where you want the tattoo. Front-facing,
          good lighting works best.
        </p>
        <label className="flex flex-col items-center justify-center border border-dashed border-ink-700 rounded-lg py-10 cursor-pointer hover:border-brand/70 transition-colors">
          <span className="text-gray-400 text-sm mb-2">
            Click to upload photo
          </span>
          <span className="text-xs text-gray-500">PNG or JPG up to ~10MB</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBodyUpload}
          />
        </label>
        {bodyImage && (
          <p className="text-xs text-gray-500 mt-2">
            Photo uploaded. You can change it by clicking the upload area again.
          </p>
        )}
      </div>

      {/* 2. Select concept */}
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
        <h3 className="text-white font-bold mb-3">2. Select a Tattoo Concept</h3>
        {savedConcepts.length === 0 ? (
          <p className="text-gray-500 text-sm">
            Generate a concept first, then you can try it on here.
          </p>
        ) : (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {savedConcepts.map((concept) => (
              <button
                key={concept.id}
                type="button"
                onClick={() => handleSelectConcept(concept)}
                className={`w-full flex items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                  selectedConcept?.id === concept.id
                    ? "border-brand bg-brand/10"
                    : "border-ink-800 hover:border-ink-600 hover:bg-ink-800/60"
                }`}
              >
                <div className="w-16 h-16 bg-ink-950 rounded overflow-hidden flex items-center justify-center">
                  <img
                    src={concept.image_url}
                    alt="Concept thumb"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-300 line-clamp-2">
                    {concept.prompt}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 3. Virtual try-on preview */}
      <div className="bg-ink-900 rounded-xl border border-ink-800 p-6">
        <h3 className="text-white font-bold mb-3">3. Virtual Try-On Preview</h3>

        <div
          ref={previewRef}
          className="relative w-full aspect-[3/4] bg-ink-950 rounded-lg overflow-hidden flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
        >
          {bodyImage ? (
            <img
              src={bodyImage}
              alt="Body"
              className="w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <p className="text-gray-500 text-sm text-center px-4">
              Upload a body photo on the left to see the virtual try-on.
            </p>
          )}

          {/* Tattoo overlay */}
          {bodyImage && currentOverlay && (
            <div
              onMouseDown={handleMouseDownTattoo}
              className="absolute cursor-move"
              style={{
                left: `${position.x * 100}%`,
                top: `${position.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
                opacity,
              }}
            >
              <img
                src={currentOverlay}
                alt="Tattoo overlay"
                className="max-w-[320px] max-h-[320px] object-contain"
              />
            </div>
          )}
        </div>

        {/* controls */}
        {bodyImage && currentOverlay && (
          <div className="mt-4 space-y-3">
            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Size</span>
                <span>{(scale * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min={0.1}      // much smaller
                max={3}        // much larger
                step={0.05}
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Rotation</span>
                <span>{rotation.toFixed(0)}°</span>
              </label>
              <input
                type="range"
                min={-90}
                max={90}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Opacity</span>
                <span>{Math.round(opacity * 100)}%</span>
              </label>
              <input
                type="range"
                min={0.2}
                max={1}
                step={0.05}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOn;
