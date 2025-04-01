"use client"

import React from "react";
import DetailsControl from "./DetailsControl";

interface PreviewProps {
  currentImageUrl: string | null;
}

const Preview = ({ currentImageUrl }: PreviewProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col">
        {/* Details control at the top */}
        <div className="mb-2 flex justify-center">
          <DetailsControl />
        </div>
        
        {/* Preview content */}
        <div className="aspect-[4/5] bg-white shadow-md overflow-hidden">
          {currentImageUrl ? (
            <img 
              src={currentImageUrl} 
              alt="Generated post" 
              className="w-full h-full object-contain"
            />
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