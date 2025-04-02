import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React from "react";

interface SlideNavigationProps {
  slides: { id: string, type: string }[];
  currentSlideIndex: number;
  onSlideChange: (index: number) => void;
  onAddSlide: () => void;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({ 
  slides, 
  currentSlideIndex, 
  onSlideChange, 
  onAddSlide 
}) => {
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

  // Get the first character of the slide type or use "-" as fallback
  const getSlideLabel = (slideType: string | undefined) => {
    if (!slideType || slideType.length === 0) {
      return "-";
    }
    return slideType.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full h-16 flex items-center px-10">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">PREV</span>
          <button 
            className="w-6 h-6 flex items-center justify-center"
            onClick={handlePrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ChevronLeft size={16} className={currentSlideIndex === 0 ? "text-gray-300" : "text-gray-600"} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          {/* Actual slides */}
          {slides.map((slide, index) => (
            <div 
              key={slide.id || `slide-index-${index}`}
              className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer ${
                index === currentSlideIndex ? 'bg-blue-500 text-white' : 'bg-gray-400'
              }`}
              onClick={() => onSlideChange(index)}
            >
              {getSlideLabel(slide.type)}
            </div>
          ))}
          
          {/* Add slide button */}
          <div 
            className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
            onClick={onAddSlide}
          >
            <Plus size={16} />
          </div>
        </div>
        
        <div className="flex items-center">
          <button 
            className="w-6 h-6 flex items-center justify-center"
            onClick={handleNextSlide}
            disabled={currentSlideIndex === slides.length - 1}
          >
            <ChevronRight size={16} className={currentSlideIndex === slides.length - 1 ? "text-gray-300" : "text-gray-600"} />
          </button>
          <span className="text-sm text-gray-500 ml-2">NEXT</span>
        </div>
      </div>
    </div>
  );
};

export default SlideNavigation;