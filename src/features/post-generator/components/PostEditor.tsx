"use client"

import React, { useState, useEffect } from "react"
import PostForm from "./PostForm"
import DetailSlideCanvas from "./DetailsSlideCanvas"
import DetailSlideControls from "./DetailsSlideControl"
import SlideNavigation from "./SlideNavigation"
import LayeredThumbnailCanvas from "./LayeredThumbnailCanvas" // Import directly for thumbnail preview

interface Slide {
  id: string;
  type: "thumbnail" | "detail";
  overlayType?: "char" | "item" | "const" | "info" | "other";
  images: string[];
}

const PostEditor: React.FC = () => {
  // Form state (would normally be in PostForm but we need it here to pass to canvases)
  const [postType, setPostType] = useState<string>("New");
  const [postCode, setPostCode] = useState<string>("AAA");
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({});
  const [netPrice, setNetPrice] = useState<string>("");
  const [isStarterAccount, setIsStarterAccount] = useState<boolean>(false);
  const [postDescription, setPostDescription] = useState<string>("");

  // State for slides management
  const [slides, setSlides] = useState<Slide[]>([
    { id: "thumbnail", type: "thumbnail", images: [] }
  ]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideImages, setSlideImages] = useState<(string | null)[]>([null]);
  
  // Get the active slide
  const activeSlide = slides[activeSlideIndex];
  const isDetailSlide = activeSlide?.type === "detail";

  // Function to add a new detail slide
  const handleAddSlide = () => {
    const newSlide: Slide = {
      id: `detail-${Date.now()}`,
      type: "detail",
      overlayType: "info", // Default overlay type
      images: []
    };
    
    setSlides([...slides, newSlide]);
    setSlideImages([...slideImages, null]);
    
    // Switch to the new slide
    setActiveSlideIndex(slides.length);
  };

  // Function to delete a slide
  const handleDeleteSlide = (index: number) => {
    // Prevent deleting the thumbnail slide
    if (index === 0) return;
    
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    
    const newSlideImages = [...slideImages];
    newSlideImages.splice(index, 1);
    
    setSlides(newSlides);
    setSlideImages(newSlideImages);
    
    // If deleting the active slide, switch to a different one
    if (activeSlideIndex === index) {
      setActiveSlideIndex(Math.max(0, index - 1));
    } else if (activeSlideIndex > index) {
      // Adjust active index if we deleted a slide before it
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  // Function to select a slide
  const handleSelectSlide = (index: number) => {
    setActiveSlideIndex(index);
  };

  // Function to handle overlay type change for detail slides
  const handleOverlayTypeChange = (type: "char" | "item" | "const" | "info" | "other") => {
    if (!isDetailSlide) return;
    
    const newSlides = [...slides];
    newSlides[activeSlideIndex] = {
      ...newSlides[activeSlideIndex],
      overlayType: type
    };
    
    setSlides(newSlides);
  };

  // Function to handle image upload for detail slides
  const handleImageUpload = (files: FileList) => {
    if (!isDetailSlide) return;
    
    const newSlides = [...slides];
    const newImages = [...newSlides[activeSlideIndex].images];
    
    // Convert FileList to URLs
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      newImages.push(url);
    });
    
    newSlides[activeSlideIndex].images = newImages;
    setSlides(newSlides);
  };

  // Function to handle image deletion for detail slides
  const handleDeleteImage = (index: number) => {
    if (!isDetailSlide) return;
    
    const newSlides = [...slides];
    const newImages = [...newSlides[activeSlideIndex].images];
    
    // Remove the URL object to prevent memory leaks
    URL.revokeObjectURL(newImages[index]);
    newImages.splice(index, 1);
    
    newSlides[activeSlideIndex].images = newImages;
    setSlides(newSlides);
  };

  // Function to handle form state changes (from PostForm)
  const handleFormChange = (
    pType: string,
    pCode: string,
    sGames: string[],
    sCharacters: { [key: string]: string },
    nPrice: string,
    starter: boolean,
    description: string
  ) => {
    setPostType(pType);
    setPostCode(pCode);
    setSelectedGames(sGames);
    setSelectedCharacters(sCharacters);
    setNetPrice(nPrice);
    setIsStarterAccount(starter);
    setPostDescription(description);
  };

  // Function to handle image generation from thumbnail canvas
  const handleThumbnailImageGenerated = (url: string | null) => {
    // Update the slide images array for thumbnail
    const newSlideImages = [...slideImages];
    newSlideImages[0] = url;
    setSlideImages(newSlideImages);
  };

  // Function to handle image generation from detail canvas
  const handleDetailImageGenerated = (url: string | null) => {
    if (isDetailSlide) {
      // Update the slide images array for the current detail slide
      const newSlideImages = [...slideImages];
      newSlideImages[activeSlideIndex] = url;
      setSlideImages(newSlideImages);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-grow">
        {/* Form Section */}
        <div className="w-full md:w-1/4 h-screen overflow-y-auto">
          <PostForm onFormChange={handleFormChange} />
        </div>
        
        {/* Canvas and Navigation Section */}
        <div className="w-full md:w-3/4 flex flex-col h-screen">
          {/* Canvas Area - Conditionally renders the appropriate canvas */}
          <div className="flex-grow relative flex items-center justify-center p-8">
            {isDetailSlide ? (
              // Detail Slide Canvas and Controls
              <>
                <DetailSlideControls
                  overlayType={activeSlide.overlayType || "info"}
                  onOverlayTypeChange={handleOverlayTypeChange}
                  onImageUpload={handleImageUpload}
                  onDeleteImage={handleDeleteImage}
                  images={activeSlide.images}
                />
                
                <DetailSlideCanvas
                  postType={postType}
                  overlayType={activeSlide.overlayType || "info"}
                  images={activeSlide.images}
                  onImageGenerated={handleDetailImageGenerated}
                />
              </>
            ) : (
              // Thumbnail Canvas
              <LayeredThumbnailCanvas
                postType={postType}
                postCode={postCode}
                selectedGames={selectedGames}
                selectedCharacters={selectedCharacters}
                netPrice={netPrice}
                isStarterAccount={isStarterAccount}
                postDescription={postDescription.toUpperCase()}
                onImageGenerated={handleThumbnailImageGenerated}
              />
            )}

            
          </div>
          
          {/* Slide Navigation at the bottom */}
          <SlideNavigation
            slides={slides.map(slide => ({ id: slide.id, type: slide.type }))}
            activeIndex={activeSlideIndex}
            onSelectSlide={handleSelectSlide}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        </div>
      </div>
    </div>
  );
};

export default PostEditor;