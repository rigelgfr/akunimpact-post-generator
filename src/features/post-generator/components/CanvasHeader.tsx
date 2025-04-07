import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Folder, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface CanvasHeaderProps {
  slides: Array<{
    id: string;
    type: string;
    imageUrl: string | null;
    detailsType?: "char" | "item" | "const" | "info" | "other";
  }>;
  postCode: string;
  onReset: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({ slides, postCode, onReset }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  const downloadAllImages = async () => {
    // Filter out slides with no imageUrl
    const slidesWithImages = slides.filter(slide => slide.imageUrl);
    
    if (slidesWithImages.length === 0 || isDownloading) {
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);

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

        setDownloadProgress(Math.round(((i + 1) / slidesWithImages.length) * 100));
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
      // Reset download state after a short delay to allow users to see 100%
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
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

  const handleReset = () => {
    // Call the onReset prop function
    onReset();
    
    // Show a success toast
    toast.success("Canvas reset successfully", {
      description: "All changes have been reset to default",
    });
  };

  return (
    <>
      <div className="absolute right-0 flex justify-end p-2 text-ai-cyan text-5xl">
        <Button 
            onClick={handleReset}
            variant="ghost"
            size="icon"
            className="hover:bg-ai-cyan/10"
            title="Reset canvas"
        >
            <RefreshCcw size={24} />
        </Button>

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

      {/* Progress overlay */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="bg-background p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Saving Post Images</h2>
            <Progress value={downloadProgress} className="h-2 mb-2" />
            <p className="text-center text-muted-foreground">{downloadProgress}% Complete</p>
          </div>
        </div>
      )}
    </>

  );
};

export default CanvasHeader;