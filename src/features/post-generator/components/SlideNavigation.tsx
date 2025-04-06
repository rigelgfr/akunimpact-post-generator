import { ChevronLeft, ChevronRight, Plus, GripHorizontal } from "lucide-react";
import React, { useState } from "react";

// Match the Slide interface from CanvasSpace
interface Slide {
  id: string;
  type: string; // 'details' or 'thumbnail'
  imageUrl: string | null;
  detailsType?: "char" | "item" | "const" | "info" | "other";
  userImages?: string[];
}

interface SlideNavigationProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
  onReorderSlides: (newSlides: Slide[]) => void;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ 
  slides, 
  currentSlideIndex, 
  onSlideChange, 
  onAddSlide,
  onReorderSlides
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  // Count how many of each details type we have for numbering
  const getDetailsTypeCount = (slideIndex: number, detailsType?: "char" | "item" | "const" | "info" | "other") => {
    if (!detailsType) return 1;
    
    let count = 0;
    for (let i = 0; i <= slideIndex; i++) {
      if (slides[i].type === 'details' && slides[i].detailsType === detailsType) {
        count++;
      }
    }
    return count;
  };

  // Get the slide label with more information
  const getSlideLabel = (slide: Slide, index: number) => {
    if (slide.type === 'thumbnail') {
      return "Thumbnail";
    } else if (slide.type === 'details' && slide.detailsType) {
      const count = getDetailsTypeCount(index, slide.detailsType);
      return `${slide.detailsType.charAt(0).toUpperCase() + slide.detailsType.slice(1)} ${count}`;
    }
    return "Details";
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    // Create a new array with the reordered slides
    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    
    // Remove the dragged slide
    newSlides.splice(draggedIndex, 1);
    
    // Insert it at the drop position
    newSlides.splice(dropIndex, 0, draggedSlide);
    
    // Update the slides order
    onReorderSlides(newSlides);
    
    // Update current slide index if needed
    let newCurrentIndex = currentSlideIndex;
    if (currentSlideIndex === draggedIndex) {
      newCurrentIndex = dropIndex;
    } else if (currentSlideIndex > draggedIndex && currentSlideIndex <= dropIndex) {
      newCurrentIndex--;
    } else if (currentSlideIndex < draggedIndex && currentSlideIndex >= dropIndex) {
      newCurrentIndex++;
    }
    
    onSlideChange(newCurrentIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full flex items-center px-10 py-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span className="text-base text-gray-500 mr-2">PREV</span>
          <button 
            className="w-6 h-6 flex items-center justify-center"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft size={20} className={currentSlideIndex === 0 ? "text-gray-300" : "text-ai-cyan"} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          {/* Slides */}
          {slides.map((slide, index) => (
            <div 
              key={slide.id || `slide-index-${index}`}
              className={`px-3 py-2 rounded-md shadow flex items-center justify-center cursor-pointer text-sm ${
                index === currentSlideIndex 
                  ? 'bg-ai-cyan text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${draggedIndex === index ? 'opacity-50' : 'opacity-100'}`}
              onClick={() => onSlideChange(index)}
              draggable={slide.type !== 'thumbnail'}
              onDragStart={() => slide.type !== 'thumbnail' && handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              {slide.type !== 'thumbnail' && <GripHorizontal size={12} className="mr-2 cursor-grab" />}
              {getSlideLabel(slide, index)}
            </div>
          ))}
          
          {/* Add slide button */}
          <div 
            className="flex items-center justify-center px-3 py-2 bg-white rounded-md shadow cursor-pointer hover:bg-gray-100"
            onClick={onAddSlide}
          >
            <Plus size={16} className="text-gray-700" />
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="w-6 h-6 flex items-center justify-center"
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight size={20} className={currentSlideIndex === slides.length - 1 ? "text-gray-300" : "text-ai-cyan"} />
          </button>
          <span className="text-base text-gray-500 ml-2">NEXT</span>
        </div>
      </div>
    </div>
  );
};

export default SlideNavigation;