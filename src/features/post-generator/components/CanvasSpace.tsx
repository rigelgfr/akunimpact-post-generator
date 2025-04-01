"use client"

import React, { useState, useEffect } from "react"
import ThumbnailCanvas from "./ThumbnailCanvas"
import CanvasNavigation from "./SlideNavigation"
import Preview from "./Preview"

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
            <ThumbnailCanvas
                postType={postType}
                postCode={postCode}
                selectedGames={selectedGames}
                selectedCharacters={selectedCharacters}
                netPrice={netPrice}
                isStarterAccount={isStarterAccount}
                postDescription={postDescription}
                onImageGenerated={handleImageGenerated}
            />
            
            {/* Use the new Preview component */}
            <Preview currentImageUrl={currentImageUrl} />
            
            {/* Navigation Area */}
            <CanvasNavigation />
        </div>
    );
};

export default CanvasSpace;