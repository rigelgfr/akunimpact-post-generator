"use client"

import { Select, SelectContent, SelectItem, SelectValue, SelectTrigger } from "@/components/ui/select";
import { DetailsOverlay } from "../data/overlay";
import { RefreshCcw, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DetailsControl({ 
    currentOverlayType, 
    onOverlayTypeChange,
    onDeleteSlide,
    onClearImages
  }: { 
    currentOverlayType: "char" | "item" | "const" | "info" | "other";
    onOverlayTypeChange: (type: "char" | "item" | "const" | "info" | "other") => void;
    onDeleteSlide: () => void;
    onClearImages: () => void
  }) {
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