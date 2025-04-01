"use client"

import React, { useEffect, useState } from "react"
import LayeredThumbnailCanvas from "./LayeredThumbnailCanvas"

interface CanvasSpaceProps {
  postType: string;
  postCode: string;
  selectedGames: string[];
  selectedCharacters: { [key: string]: string };
  netPrice: string;
  isStarterAccount: boolean;
  postDescription: string;
  onImageGenerated: (url: string | null) => void; // Add this prop
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
    const [isGenerating, setIsGenerating] = useState(false);

    // Handle changes to props
    useEffect(() => {
        setIsGenerating(true);
    }, [postType, postCode, selectedGames, selectedCharacters, netPrice, isStarterAccount, postDescription]);

    // Handle image generated callback
    const handleLayeredCanvasImageGenerated = (url: string | null) => {
        setIsGenerating(false);
        onImageGenerated(url); // Pass to parent
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center">
            <LayeredThumbnailCanvas
                postType={postType}
                postCode={postCode}
                selectedGames={selectedGames}
                selectedCharacters={selectedCharacters}
                netPrice={netPrice}
                isStarterAccount={isStarterAccount}
                postDescription={postDescription}
                onImageGenerated={handleLayeredCanvasImageGenerated}
            />
        </div>
    );
};

export default CanvasSpace;