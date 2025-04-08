"use client"

import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { DetailsOverlay } from "../data/overlay";
import { RefreshCcw, Trash, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

export default function DetailsControl({ 
    currentOverlayType, 
    onOverlayTypeChange,
    onDeleteSlide,
    onClearImages,
    onAddImages
  }: { 
    currentOverlayType: "char" | "item" | "const" | "info" | "other";
    onOverlayTypeChange: (type: "char" | "item" | "const" | "info" | "other") => void;
    onDeleteSlide: () => void;
    onClearImages: () => void;
    onAddImages: (files: FileList) => void;
  }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileButtonClick = () => {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files && event.target.files.length > 0) {
        onAddImages(event.target.files);
        // Reset the input value so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    return (
      <div className="flex items-center w-full">
        <Select value={currentOverlayType} onValueChange={(value: "char" | "item" | "const" | "info" | "other") => onOverlayTypeChange(value)}>
          <SelectTrigger className="bg-white mb-2 w-24 border text-xs !h-6 rounded-sm">
            <SelectValue placeholder="Details" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DetailsOverlay).map(([type]) => (
              <SelectItem key={type} value={type} className="text-sm">
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
  
        <span className="flex w-full justify-end text-ai-cyan">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            multiple
          />
          <Button 
            variant="ghost" size="icon" className="hover:bg-ai-cyan/10 !h-6 !w-6"
            onClick={handleFileButtonClick}
            title="Upload image"
          >
            <ImagePlus />
          </Button>
          <Button 
            variant="ghost" size="icon" className="hover:bg-ai-cyan/10 !h-6 !w-6"
            onClick={onClearImages}
            title="Clear all images"
          >
            <RefreshCcw />
          </Button>
          <Button 
            variant="ghost" size="icon" className="hover:bg-ai-cyan/10 !h-6 !w-6"
            onClick={onDeleteSlide}
            title="Delete slide"
          >
            <Trash />
          </Button>
        </span>
      </div>
    );
  }