"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import ThumbnailCanvas from "./ThumbnailCanvas"
import DetailsCanvas from "./DetailsCanvas"
import SlideNavigation from "./SlideNavigation"
import Preview from "./Preview"
import { handleClipboardImage } from "../utils/image-utils" // Import the new utility
import { getImageType, preloadImage } from "../utils/image-utils";
import CanvasHeader from "./CanvasHeader"

interface CanvasSpaceProps {
  postType: string;
  postCode: string;
  selectedGames: string[];
  selectedCharacters: { [key: string]: string };
  netPrice: string;
  isStarterAccount: boolean;
  postDescription: string;
  onImageGenerated: (url: string | null) => void;
  onReset?: () => void; // Add this prop
}

interface Slide {
  id: string;
  type: string; // 'details' or 'thumbnail'
  imageUrl: string | null;
  detailsType?: "char" | "item" | "const" | "info" | "other";
  userImages?: string[];
}

const CanvasSpace: React.FC<CanvasSpaceProps> = ({
  postType,
  postCode,
  selectedGames,
  selectedCharacters,
  netPrice,
  isStarterAccount,
  postDescription,
  onImageGenerated,
  onReset
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

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use a ref to prevent infinite render loops
  const isUpdatingImage = useRef(false);
  
  // Generate a unique ID for new slides
  const generateSlideId = () => `slide-${slides.length + 1}`;

  // Add this function in the CanvasSpace component
  const handleAddImages = async (files: FileList) => {
    if (!files.length || currentSlide.type !== 'details') return;
    
    // Convert FileList to array for easier handling
    const fileArray = Array.from(files);
    
    // Process each file
    for (const file of fileArray) {
      try {
        // Create blob URL for the file
        const imageUrl = URL.createObjectURL(file);
        
        // Create Image object to get dimensions
        const newImage = await preloadImage(imageUrl);
        
        // Get current images from the slide
        const currentUserImages = slides[currentSlideIndex].userImages || [];
        const newImageType = getImageType(newImage);
        
        // Load all existing images to check compatibility
        const existingImages: HTMLImageElement[] = [];
        for (const imgUrl of currentUserImages) {
          try {
            const img = await preloadImage(imgUrl);
            existingImages.push(img);
          } catch (err) {
            console.error("Failed to load existing image:", err);
          }
        }
        
        // Create a test set including the new image
        const testImages = [...existingImages, newImage];
        
        // Check if adding this image would violate our rules
        if (newImageType === 'portrait-mobile' && testImages.length > 2) {
          setErrorMessage("Maximum of 2 portrait mobile images allowed");
          URL.revokeObjectURL(imageUrl); // Clean up
          continue;
        }

        // Check for portrait desktop limit (1 image)
        if (newImageType === 'portrait-desktop' && testImages.length > 1) {
          setErrorMessage("Maximum of 1 portrait desktop image allowed");
          URL.revokeObjectURL(imageUrl); // Clean up
          continue;
        }
        
        // Check for landscape limits
        const firstType = existingImages.length > 0 ? getImageType(existingImages[0]) : newImageType;
        const allSameType = testImages.every(img => getImageType(img) === firstType);
        const allLandscapes = testImages.every(img => {
          const type = getImageType(img);
          return type === 'landscape-mobile' || type === 'landscape-desktop';
        });
        
        if (firstType === 'landscape-mobile' && testImages.length > 3 && allSameType) {
          setErrorMessage("Maximum of 3 landscape mobile images allowed");
          URL.revokeObjectURL(imageUrl);
          continue;
        }
        
        if (firstType === 'landscape-desktop' && testImages.length > 2 && allSameType) {
          setErrorMessage("Maximum of 2 landscape desktop images allowed");
          URL.revokeObjectURL(imageUrl);
          continue;
        }
        
        if (allLandscapes && !allSameType && testImages.length > 2) {
          setErrorMessage("Maximum of 2 mixed landscape images allowed");
          URL.revokeObjectURL(imageUrl);
          continue;
        }
        
        // Check if image types are compatible
        if (!allSameType && !allLandscapes) {
          setErrorMessage("Images must be all portrait mobile, all landscape mobile, all landscape desktop, or mixed landscapes");
          URL.revokeObjectURL(imageUrl);
          continue;
        }
        
        // If we made it here, the image is valid
        console.log("Image validation passed, adding to slide");
        
        // Update the current slide with the new image
        setSlides(prevSlides => {
          const updatedSlides = [...prevSlides];
          const currentUserImages = updatedSlides[currentSlideIndex].userImages || [];
          
          updatedSlides[currentSlideIndex] = {
            ...updatedSlides[currentSlideIndex],
            userImages: [...currentUserImages, imageUrl]
          };
          
          return updatedSlides;
        });
      } catch (error) {
        console.error("Error processing image:", error);
        setErrorMessage("Failed to process image");
      }
    }
    
    // Trigger a re-render of the canvas with the new images
    setTimeout(() => {
      // This will trigger the DetailsCanvas to re-render
      const detailsCanvas = document.querySelector('canvas');
      if (detailsCanvas) {
        console.log("Triggering canvas re-render");
        const event = new Event('canvasUpdate');
        detailsCanvas.dispatchEvent(event);
      }
    }, 100);
  };

  // Setup paste event listener
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      // Only process paste events if we're on a details slide
      if (currentSlide.type !== 'details') return;
      
      // Prevent default paste behavior
      event.preventDefault();
      
      console.log("Paste event detected");
      
      // Try to get image from clipboard
      const imageUrl = await handleClipboardImage(event);
      
      if (imageUrl) {
        console.log("Image found in clipboard, validating...");
        
        // Create Image object to get dimensions
        const newImage = await preloadImage(imageUrl);
        
        // Get current images from the slide
        const currentUserImages = slides[currentSlideIndex].userImages || [];
        const newImageType = getImageType(newImage);
        
        // Load all existing images to check compatibility
        const existingImages: HTMLImageElement[] = [];
        for (const imgUrl of currentUserImages) {
          try {
            const img = await preloadImage(imgUrl);
            existingImages.push(img);
          } catch (err) {
            console.error("Failed to load existing image:", err);
          }
        }
        
        // Create a test set including the new image
        const testImages = [...existingImages, newImage];
        
        // Check if adding this image would violate our rules
        if (newImageType === 'portrait-mobile' && testImages.length > 2) {
          setErrorMessage("Maximum of 2 portrait mobile images allowed");
          URL.revokeObjectURL(imageUrl); // Clean up
          return;
        }

        // Check for portrait desktop limit (1 image)
        if (newImageType === 'portrait-desktop' && testImages.length > 1) {
          setErrorMessage("Maximum of 1 portrait desktop image allowed");
          URL.revokeObjectURL(imageUrl); // Clean up
          return;
        }
        
        // Check for landscape limits
        const firstType = existingImages.length > 0 ? getImageType(existingImages[0]) : newImageType;
        const allSameType = testImages.every(img => getImageType(img) === firstType);
        const allLandscapes = testImages.every(img => {
          const type = getImageType(img);
          return type === 'landscape-mobile' || type === 'landscape-desktop';
        });
        
        if (firstType === 'landscape-mobile' && testImages.length > 3 && allSameType) {
          setErrorMessage("Maximum of 3 landscape mobile images allowed");
          URL.revokeObjectURL(imageUrl);
          return;
        }
        
        if (firstType === 'landscape-desktop' && testImages.length > 2 && allSameType) {
          setErrorMessage("Maximum of 2 landscape desktop images allowed");
          URL.revokeObjectURL(imageUrl);
          return;
        }
        
        if (allLandscapes && !allSameType && testImages.length > 2) {
          setErrorMessage("Maximum of 2 mixed landscape images allowed");
          URL.revokeObjectURL(imageUrl);
          return;
        }
        
        // Check if image types are compatible
        if (!allSameType && !allLandscapes) {
          setErrorMessage("Images must be all portrait mobile, all landscape mobile, all landscape desktop, or mixed landscapes");
          URL.revokeObjectURL(imageUrl);
          return;
        }
        
        // If we made it here, the image is valid
        console.log("Image validation passed, adding to slide");
        
        // Update the current slide with the new image
        setSlides(prevSlides => {
          const updatedSlides = [...prevSlides];
          const currentUserImages = updatedSlides[currentSlideIndex].userImages || [];
          
          updatedSlides[currentSlideIndex] = {
            ...updatedSlides[currentSlideIndex],
            userImages: [...currentUserImages, imageUrl]
          };
          
          return updatedSlides;
        });
        
        // Trigger a re-render of the canvas with the new image
        setTimeout(() => {
          // This will trigger the DetailsCanvas to re-render
          const detailsCanvas = document.querySelector('canvas');
          if (detailsCanvas) {
            console.log("Triggering canvas re-render");
            const event = new Event('canvasUpdate');
            detailsCanvas.dispatchEvent(event);
          }
        }, 100);
      } else {
        console.log("No image found in clipboard");
      }
    };
    
    // Add paste event listener to the window
    window.addEventListener('paste', handlePaste);
    
    // Clean up
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [currentSlide.type, currentSlideIndex, slides]);

  useEffect(() => {
    if (!errorMessage) return;
    
    const timer = setTimeout(() => {
      setErrorMessage(null);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [errorMessage]);

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

  const handleReorderSlides = (newSlides: Slide[]) => {
    setSlides(newSlides);
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

  const handleClearImages = () => {
    // First, revoke any object URLs to prevent memory leaks
    const currentUserImages = currentSlide.userImages || [];
    currentUserImages.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    
    // Update the current slide to remove all user images
    setSlides(prevSlides => {
      const updatedSlides = [...prevSlides];
      updatedSlides[currentSlideIndex] = {
        ...updatedSlides[currentSlideIndex],
        userImages: [],
        imageUrl: null // Also clear the rendered image
      };
      return updatedSlides;
    });
    
    // Update the current image URL
    setCurrentImageUrl(null);
  };

  // Cleanup effect to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Loop through all slides and revoke any blob URLs
      slides.forEach(slide => {
        const userImages = slide.userImages || [];
        userImages.forEach(url => {
          if (url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      });
    };
  }, [slides]);

  const handleReset = useCallback(() => {
    // Reset slides to default (only thumbnail)
    setSlides([
      { id: 'slide-1', type: 'thumbnail', imageUrl: null }
    ]);
    
    // Reset current slide index
    setCurrentSlideIndex(0);
    
    // Reset image URL
    setCurrentImageUrl(null);
    
    // Reset current details type
    setCurrentDetailsType("char");
    
    // Notify parent component that thumbnail was reset
    onImageGenerated(null);

    // Notify parent component
    if (onReset) {
      onReset();
    }
  }, [onReset, onImageGenerated]);

  return (
      <div className="h-full flex flex-col bg-canva-gray overflow-y-scroll">
          <CanvasHeader slides={slides} postType={postType} postCode={postCode} onReset={handleReset}/>

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
                  images={currentSlide.userImages || []}
                  onImageGenerated={handleImageGenerated}
              />
          )}
          
          {/* Preview with current slide information */}
          <Preview 
            currentImageUrl={currentSlide.imageUrl} 
            currentSlide={currentSlide.type}
            currentDetailsType={currentSlide.detailsType || "char"}
            onDetailsTypeChange={handleDetailsTypeChange}
            onAddImages={handleAddImages}
            onDeleteSlide={handleDeleteSlide}
            onClearImages={handleClearImages}
            errorMessage={errorMessage} // Pass the error message to Preview
          />
          
          {/* Navigation Area with slide controls */}
          <SlideNavigation 
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideChange={handleSlideChange}
            onAddSlide={handleAddSlide}
            onReorderSlides={handleReorderSlides}
          />
      </div>
  );
};

export default CanvasSpace;