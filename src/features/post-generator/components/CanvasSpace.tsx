"use client"

import React, { useState, useEffect } from "react"
import LayeredThumbnailCanvas from "./LayeredThumbnailCanvas"
import CanvasNavigation from "./SlideNavigation"

interface CanvasSpaceProps {
  postType: string;
  postCode: string;
  selectedGames: string[];
  selectedCharacters: { [key: string]: string };
  netPrice: string;
  isStarterAccount: boolean;
  postDescription: string;
  onImageGenerated: (url: string | null) => void;
}

const CanvasSpace: React.FC<CanvasSpaceProps> = ({
  postType,
  postCode,
  selectedGames,
  selectedCharacters,
  netPrice,
  isStarterAccount,
  postDescription,
  onImageGenerated
}) => {
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // Handle image generated from the hidden canvas
    const handleImageGenerated = (url: string | null) => {
        setCurrentImageUrl(url);
        onImageGenerated(url);
    };

    // Trigger rendering when inputs change
    useEffect(() => {
    }, [postType, postCode, selectedGames, selectedCharacters, netPrice, isStarterAccount, postDescription]);

    return (
        <div className="h-full flex flex-col">
            {/* Hidden canvas that actually renders at full resolution */}
            <div className="hidden">
                <LayeredThumbnailCanvas
                    postType={postType}
                    postCode={postCode}
                    selectedGames={selectedGames}
                    selectedCharacters={selectedCharacters}
                    netPrice={netPrice}
                    isStarterAccount={isStarterAccount}
                    postDescription={postDescription}
                    onImageGenerated={handleImageGenerated}
                />
            </div>
            
            {/* Visible preview area with proper layout proportions */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="relative w-full max-w-md aspect-[4/5] bg-white shadow-md overflow-hidden">
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
            
            {/* Navigation Area */}
            <CanvasNavigation />
        </div>
    );
};

export default CanvasSpace;