"use client"

import React, { useState, useEffect, useRef } from "react"
import ThumbnailCanvas from "./ThumbnailCanvas"
import DetailsCanvas from "./DetailsCanvas"
import SlideNavigation from "./SlideNavigation"
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

interface Slide {
  id: string;
  type: string; // 'details' or 'thumbnail'
  imageUrl: string | null;
  detailsType?: "char" | "item" | "const" | "info" | "other";
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
    // Initialize with thumbnail as the first slide
    const [slides, setSlides] = useState<Slide[]>([
      { id: 'slide-1', type: 'thumbnail', imageUrl: null }
    ]);
    
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);

    // Get current slide - with null check for safety
    const currentSlide = slides[currentSlideIndex] || slides[0];

    const [currentDetailsType, setCurrentDetailsType] = useState<"char" | "item" | "const" | "info" | "other">("char");
    
    // Use a ref to prevent infinite render loops
    const isUpdatingImage = useRef(false);
    
    // Generate a unique ID for new slides
    const generateSlideId = () => `slide-${slides.length + 1}`;

    // Handle image generated from the canvas
    const handleImageGenerated = (url: string | null) => {
        // Only update if the URL actually changed
        if (isUpdatingImage.current || url === currentImageUrl) return;
        
        isUpdatingImage.current = true;
        
        console.log(`Updating image for ${slides[currentSlideIndex]?.type} slide`);
        setCurrentImageUrl(url);
        
        // Update slides regardless of type
        setSlides(prevSlides => {
            const updatedSlides = [...prevSlides];
            updatedSlides[currentSlideIndex] = {
              ...updatedSlides[currentSlideIndex],
              imageUrl: url
            };
            return updatedSlides;
        });
        
        // Only pass to parent component if this is the first slide
        if (currentSlideIndex === 0) {
          onImageGenerated(url);
        }
        
        isUpdatingImage.current = false;
    };
    
    // Handle slide change
    const handleSlideChange = (index: number) => {
        setCurrentSlideIndex(index);
        // Explicitly get the image URL from the specific slide
        const newImageUrl = slides[index]?.imageUrl || null;
        console.log(`Switching to slide ${index}, type: ${slides[index]?.type}`);
        setCurrentImageUrl(newImageUrl);
      };
    
    // Handle adding a new slide - always add 'details' type slides
    const handleAddSlide = () => {
        const newSlide: Slide = {
          id: generateSlideId(),
          type: 'details', 
          imageUrl: null,
          detailsType: currentDetailsType
        };
        
        setSlides(prevSlides => {
          const updatedSlides = [...prevSlides, newSlide];
          // Use setTimeout in this callback to ensure we have access to the updated length
          setTimeout(() => {
            setCurrentSlideIndex(updatedSlides.length - 1);
            setCurrentImageUrl(null);
          }, 0);
          return updatedSlides;
        });
      };

      const handleDeleteSlide = () => {
        // Don't delete if it's the only slide
        if (slides.length <= 1) {
          return;
        }
        
        // Create new array without the current slide
        const updatedSlides = slides.filter((_, index) => index !== currentSlideIndex);
        
        // Calculate new index to focus on after deletion
        const newIndex = currentSlideIndex >= updatedSlides.length 
          ? updatedSlides.length - 1 
          : currentSlideIndex;
        
        // Update slides state
        setSlides(updatedSlides);
        
        // Update current index
        setCurrentSlideIndex(newIndex);
        
        // Update current image URL
        setCurrentImageUrl(updatedSlides[newIndex]?.imageUrl || null);
        
        // If we're deleting the first slide (thumbnail), notify parent
        if (currentSlideIndex === 0) {
          onImageGenerated(updatedSlides[0]?.imageUrl || null);
        }
      };

    const handleDetailsTypeChange = (type: "char" | "item" | "const" | "info" | "other") => {
      setCurrentDetailsType(type);
      
      // Update the current slide's overlay type
      setSlides(prevSlides => {
        const updatedSlides = [...prevSlides];
        if (updatedSlides[currentSlideIndex]?.type === 'details') {
          updatedSlides[currentSlideIndex] = {
            ...updatedSlides[currentSlideIndex],
            detailsType: type
          };
        }
        return updatedSlides;
      });
    };

    return (
        <div className="h-full flex flex-col">
            {currentSlide.type === 'thumbnail' && (
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
            )}

            {currentSlide.type === 'details' && (
                <DetailsCanvas
                    postType={postType}
                    overlayType={currentSlide.detailsType || "char"}
                    images={[]} // You'll need to populate this with user images later
                    onImageGenerated={handleImageGenerated}
                />
            )}
            
            {/* Preview with current slide information */}
            <Preview 
              currentImageUrl={currentSlide.imageUrl} 
              currentSlide={currentSlide.type}
              currentDetailsType={currentSlide.detailsType || "char"}
              onDetailsTypeChange={handleDetailsTypeChange}
              onDeleteSlide={handleDeleteSlide}
            />
            
            {/* Navigation Area with slide controls */}
            <SlideNavigation 
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSlideChange={handleSlideChange}
              onAddSlide={handleAddSlide}
            />
        </div>
    );
};

export default CanvasSpace;