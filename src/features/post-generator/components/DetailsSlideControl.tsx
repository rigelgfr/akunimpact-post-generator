import React from "react";
import { UploadCloud, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DetailSlideControlsProps {
  overlayType: "char" | "item" | "const" | "info" | "other";
  onOverlayTypeChange: (type: "char" | "item" | "const" | "info" | "other") => void;
  onImageUpload: (files: FileList) => void;
  onDeleteImage: (index: number) => void;
  images: string[];
}

const DetailSlideControls: React.FC<DetailSlideControlsProps> = ({
  overlayType,
  onOverlayTypeChange,
  onImageUpload,
  onDeleteImage,
  images
}) => {
  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onImageUpload(e.target.files);
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 bg-white bg-opacity-90 rounded-lg shadow-lg p-3 z-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Detail Slide Options</h3>
      </div>
      
      <div className="flex flex-col space-y-3">
        {/* Overlay Type Selection */}
        <div className="flex items-center">
          <span className="text-xs mr-2 w-20">Overlay Type:</span>
          <Select value={overlayType} onValueChange={(value: any) => onOverlayTypeChange(value)}>
            <SelectTrigger className="h-7 text-xs border-input focus:border-ai-cyan focus:ring-1 focus:ring-ai-cyan">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="text-xs">
              <SelectItem value="char" className="text-xs">Character</SelectItem>
              <SelectItem value="item" className="text-xs">Item</SelectItem>
              <SelectItem value="const" className="text-xs">Constellation</SelectItem>
              <SelectItem value="info" className="text-xs">Info</SelectItem>
              <SelectItem value="other" className="text-xs">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Image Upload */}
        <div className="flex items-center">
          <span className="text-xs mr-2 w-20">Images:</span>
          <label className="flex items-center justify-center px-3 py-1.5 text-xs bg-ai-cyan text-white rounded-md cursor-pointer hover:bg-ai-cyan-dark transition-colors">
            <UploadCloud className="h-3 w-3 mr-1" />
            Upload Image
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              multiple
            />
          </label>
        </div>
        
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {images.map((image, index) => (
              <div key={index} className="relative group h-12 w-12 rounded overflow-hidden">
                <img src={image} alt={`Image ${index + 1}`} className="h-full w-full object-cover" />
                <button
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteImage(index)}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailSlideControls;