import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import React from "react";

const CanvasNavigation: React.FC = () => {
  return (
    <div className="w-full h-16 flex items-center px-10">
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">NEXT</span>
          <button className="w-6 h-6 flex items-center justify-center">
            <ChevronLeft size={16} />
          </button>
        </div>
        
        <div className="flex space-x-2">
          {/* Placeholder for thumbnails - you can add actual slide previews later */}
            <div className="w-10 h-10 bg-gray-400 rounded">{/* Placeholder for thumbnail */}</div>
            <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded"><Plus size={16} /></div>
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