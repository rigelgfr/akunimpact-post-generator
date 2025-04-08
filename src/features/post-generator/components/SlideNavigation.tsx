import { ChevronLeft, ChevronRight, Plus, GripHorizontal } from "lucide-react";
import React, { useState } from "react";

interface Slide {
  id: string;
  type: string;
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
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  
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
    // Don't allow dragging over the thumbnail position
    if (index === 0) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "none";
      return;
    }
    
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    
    // Determine if we're targeting the left or right half of the element
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isLeftHalf = x < rect.width / 2;
    
    // Set the target index where the slide would be dropped
    const targetIndex = isLeftHalf ? index : index + 1;
    
    // Don't allow dropping at index 0 or 1 (before or after thumbnail)
    if (targetIndex <= 1) {
      setDropTargetIndex(1);
    } else {
      setDropTargetIndex(targetIndex);
    }
  };

  const handleDragLeave = () => {
    // When dragging out of the slides area, clear the target
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) {
      setDropTargetIndex(null);
      return;
    }
    
    // Get the final drop target
    const finalDropTarget = dropTargetIndex === null ? index : dropTargetIndex;
    
    // Don't allow dropping at position 0 (thumbnail position)
    if (finalDropTarget === 0) {
      setDropTargetIndex(null);
      return;
    }
    
    // Don't allow dragging the thumbnail
    if (draggedIndex === 0) {
      setDropTargetIndex(null);
      return;
    }
    
    // Calculate the actual insertion index
    let insertIndex = finalDropTarget;
    if (draggedIndex < insertIndex) {
      // If dragging from before to after, need to adjust for the removed item
      insertIndex--;
    }
    
    // Create a new array with the reordered slides
    const newSlides = [...slides];
    const draggedSlide = newSlides[draggedIndex];
    
    // Remove the dragged slide
    newSlides.splice(draggedIndex, 1);
    
    // Insert it at the drop position
    newSlides.splice(insertIndex, 0, draggedSlide);
    
    // Update the slides order
    onReorderSlides(newSlides);
    
    // Update current slide index if needed
    let newCurrentIndex = currentSlideIndex;
    if (currentSlideIndex === draggedIndex) {
      newCurrentIndex = insertIndex;
    } else if (currentSlideIndex > draggedIndex && currentSlideIndex <= insertIndex) {
      newCurrentIndex--;
    } else if (currentSlideIndex < draggedIndex && currentSlideIndex >= insertIndex) {
      newCurrentIndex++;
    }
    
    onSlideChange(newCurrentIndex);
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDropTargetIndex(null);
  };

  // Function to render drop indicators
  const renderDropIndicator = (index: number) => {
    // Only show indicator if something is being dragged
    if (draggedIndex === null) return null;
    
    // Don't show indicator for index 0 (before thumbnail) or 1 (after thumbnail)
    if (index === 0) return null;
    
    // Show the indicator if this is the current drop target
    const isDropTarget = dropTargetIndex === index;
    
    if (!isDropTarget) return null;
    
    return (
      <div className="absolute left-0 h-full w-1 bg-ai-cyan rounded-full" 
           style={{ left: -2 }} />
    );
  };

  return (
    <div className="w-full flex items-center px-6 py-4 bg-canva-gray">
      <div className="flex justify-center md:justify-between items-center w-full overflow-x-auto">
        <div className="max-md:hidden flex items-center">
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
          {/* Container for slides with event handlers on container level */}
          <div 
            className="flex space-x-2"
            onDragLeave={handleDragLeave}
          >
            {/* Slides */}
            {slides.map((slide, index) => (
              <div 
                key={slide.id || `slide-index-${index}`}
                className={`px-3 py-2 rounded-md shadow flex items-center justify-center cursor-pointer text-sm relative ${
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
                {/* Drop indicator */}
                {renderDropIndicator(index)}
                
                {/* After-slide drop indicator */}
                {dropTargetIndex === index + 1 && draggedIndex !== null && (
                  <div className="absolute right-0 h-full w-1 bg-ai-cyan rounded-full" 
                       style={{ right: -2 }} />
                )}
                
                {slide.type !== 'thumbnail' && <GripHorizontal size={12} className="mr-2 cursor-grab" />}
                {getSlideLabel(slide, index)}
              </div>
            ))}
          </div>
          
          {/* Add slide button */}
          <div 
            className="flex items-center justify-center p-2 bg-white rounded-md shadow cursor-pointer hover:bg-gray-100"
            onClick={onAddSlide}
          >
            <Plus size={16} className="text-gray-700" />
          </div>
        </div>
        
        <div className="max-md:hidden flex items-center">
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