import React from "react";
import { PlusCircle, Trash2 } from "lucide-react";

interface SlideNavigationProps {
  slides: Array<{id: string; type: string}>;
  activeIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
}

const SlideNavigation: React.FC<SlideNavigationProps> = ({
  slides,
  activeIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
}) => {
  return (
    <div className="flex flex-col items-center px-4 py-2 border-t border-gray-200">
      <div className="flex items-center justify-center w-full mb-2">
        <h3 className="text-sm font-medium mr-2">Slides</h3>
        <button 
          onClick={onAddSlide}
          className="flex items-center justify-center text-xs text-ai-cyan hover:text-ai-cyan-dark transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Detail Slide
        </button>
      </div>
      
      <div className="flex items-center space-x-2 overflow-x-auto w-full py-2">
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className={`relative group flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 ${
              activeIndex === index ? "border-ai-cyan" : "border-gray-200"
            }`}
            onClick={() => onSelectSlide(index)}
          >
            {/* Simple text representation instead of image */}
            <div className="w-24 h-16 bg-gray-100 flex items-center justify-center">
              <div className="text-sm font-medium">
                {slide.type === "thumbnail" ? "Thumbnail" : "Detail"} - {index + 1}
              </div>
            </div>
            
            {/* Delete button (hidden for thumbnail) */}
            {index > 0 && (
              <button
                className="absolute bottom-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(index);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideNavigation;