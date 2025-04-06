"use client"

import React from "react";
import DetailsControl from "./DetailsControl";

interface PreviewProps {
  currentImageUrl: string | null;
  currentSlide: string; // Add a prop to track the current slide
  currentDetailsType?: "char" | "item" | "const" | "info" | "other";
  onDetailsTypeChange?: (type: "char" | "item" | "const" | "info" | "other") => void;
  onDeleteSlide?: () => void;
  onClearImages?: () => void; // Add this prop for clearing images
  errorMessage?: string | null; // Add this prop
}

const Preview = ({ 
  currentImageUrl, 
  currentSlide,
  currentDetailsType = "char",
  onDetailsTypeChange = () => {},
  onDeleteSlide = () => {},
  onClearImages = () => {},
  errorMessage = null, // Default to null if not provided
}: PreviewProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-xl flex flex-col">
        {/* Details control container - always present for spacing */}
        <div className="flex justify-center h-8">
          {/* Only render DetailsControl when on the 'details' slide */}
          {currentSlide === 'details' && (
            <DetailsControl 
              currentOverlayType={currentDetailsType} 
              onOverlayTypeChange={onDetailsTypeChange} 
              onDeleteSlide={onDeleteSlide}
              onClearImages={onClearImages}
            />
          )}
        </div>
        
        {/* Preview content */}
        <div className="aspect-[4/5] bg-white shadow-md overflow-hidden relative">
          {currentImageUrl ? (
            <div className="relative w-full h-full">
              <img 
                src={currentImageUrl} 
                alt="Generated post" 
                className="w-full h-full object-contain select-none"
                loading="lazy"
                decoding="sync"
              />
              {/* Error overlay - positioned to cover only the image */}
              {errorMessage && (
                <div className="absolute inset-0 bg-red-700/50 flex items-center justify-center animate-fade-in">
                  <div>
                    <p className="text-center text-sm font-medium text-white">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Preview will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;