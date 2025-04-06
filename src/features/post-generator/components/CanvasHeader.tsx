import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Folder } from "lucide-react";
import { toast } from "sonner";

interface CanvasHeaderProps {
  slides: Array<{
    id: string;
    type: string;
    imageUrl: string | null;
    detailsType?: "char" | "item" | "const" | "info" | "other";
  }>;
  postCode: string;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({ slides, postCode }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadAllImages = async () => {
    // Filter out slides with no imageUrl
    const slidesWithImages = slides.filter(slide => slide.imageUrl);
    
    if (slidesWithImages.length === 0 || isDownloading) {
      return;
    }
    
    setIsDownloading(true);
    
    try {
      // Keep track of successful and failed downloads
      let successCount = 0;
      let failedCount = 0;
      
      // Download each image sequentially to avoid overwhelming the server
      for (let i = 0; i < slidesWithImages.length; i++) {
        const slide = slidesWithImages[i];
        if (!slide.imageUrl) continue;
        
        const slideType = slide.type === 'thumbnail' ? 'thumbnail' : `detail-${slide.detailsType || 'other'}`;
        const slideIndex = slides.indexOf(slide);
        const isThumbnail = slideIndex === 0 || slide.type === 'thumbnail';
        
        // Call the API route for each image
        const response = await fetch('/api/save-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            imageUrl: slide.imageUrl, 
            postCode, 
            fileName: `${postCode}-${slideType}-${slideIndex}`,
            applyMasking: !isThumbnail // Only apply masking to non-thumbnail images
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          failedCount++;
          console.error(`Failed to save slide ${slideIndex}:`, result.error);
        } else {
          successCount++;
        }
      }
      
      // Show appropriate toast message based on results
      if (successCount === slidesWithImages.length) {
        toast.success(`All ${successCount} images saved successfully`, {
          description: `Saved to posts/${postCode}`,
        });
      } else if (successCount > 0) {
        toast.success(`${successCount}/${slidesWithImages.length} images saved`, {
          description: `${failedCount} images failed to save`,
        });
      } else {
        toast.error("Failed to save any images");
      }
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to save images", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to open the main posts folder
  const openPostsFolder = async () => {
    try {
      const response = await fetch('/api/open-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: 'posts' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to open folder');
      }
    } catch (error) {
      console.error('Failed to open folder:', error);
      toast.error("Couldn't open folder", {
        description: "Please navigate to the folder manually."
      });
    }
  };

  return (
    <div className="absolute right-0 flex justify-end p-2 text-ai-cyan text-5xl">
        <Button 
            onClick={downloadAllImages} 
            disabled={!slides.some(slide => slide.imageUrl) || isDownloading}
            variant="ghost"
            size="icon"
            className="hover:bg-ai-cyan/10"
            title="Save all slide images"
        >
            <Download size={24} /> {/* Increase icon size here */}
        </Button>
        
        <Button
            onClick={openPostsFolder}
            variant="ghost"
            size="icon"
            className="hover:bg-ai-cyan/10"
            title="Open posts folder"
        >
            <Folder size={24} /> {/* Increase icon size here */}
        </Button>
    </div>
  );
};

export default CanvasHeader;