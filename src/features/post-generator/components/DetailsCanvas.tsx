import React, { useEffect, useRef, useState } from "react";
import { renderDetailsLayers } from "../utils/canvas-utils";

export interface DetailsCanvasProps {
  postType: string;
  overlayType: "char" | "item" | "const" | "info" | "other";
  images: string[];
  onImageGenerated: (imageUrl: string | null) => void;
}

const DetailsCanvas: React.FC<DetailsCanvasProps> = ({
  postType,
  overlayType,
  images,
  onImageGenerated
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const canvasWidth = 1080;
  const canvasHeight = 1350;

  // Render each layer with a buffer canvas to prevent glitching
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Keep track of the render ID to prevent race conditions
    let currentRenderID = Date.now();
    setIsRendering(true);

    // Start rendering process
    renderDetailsLayers({
      canvas,
      canvasWidth,
      canvasHeight,
      postType,
      overlayType,
      images,
      currentRenderID,
      setCurrentRenderID: (id) => { currentRenderID = id; },
      onComplete: (imageUrl) => {
        onImageGenerated(imageUrl);
        setIsRendering(false);
      }
    });

    // Cleanup function
    return () => {
      currentRenderID = -1; // Invalidate the current render ID to cancel any ongoing rendering
    };
  }, [postType, overlayType, images, onImageGenerated]);

  return (
    <div className="relative hidden" style={{ width: canvasWidth / 2, height: canvasHeight / 2 }}>
      <canvas 
        ref={canvasRef} 
        width={canvasWidth} 
        height={canvasHeight} 
        className="w-full h-full"
      />
      {isRendering && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <div className="text-sm text-gray-600">Rendering...</div>
        </div>
      )}
    </div>
  );
};

export default DetailsCanvas;