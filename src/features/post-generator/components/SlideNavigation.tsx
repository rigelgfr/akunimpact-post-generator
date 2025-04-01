import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";

const CanvasNavigation: React.FC = () => {
  return (
    <div className="w-full h-16 flex items-center px-4">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">NEXT</span>
          <button className="w-6 h-6 flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          {/* Placeholder for thumbnails - you can add actual thumbnails later */}
          {[1, 2, 3, 4, 5].map((_, index) => (
            <div key={index} className="w-10 h-10 bg-gray-400 rounded"></div>
          ))}
        </div>
        
        <div className="flex items-center">
          <button className="w-6 h-6 flex items-center justify-center">
            <ChevronRight size={16} />
          </button>
          <span className="text-sm text-gray-500 ml-2">SWIPE</span>
        </div>
      </div>
    </div>
  );
};

export default CanvasNavigation;