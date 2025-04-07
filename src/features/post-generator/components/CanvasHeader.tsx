import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";
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
  postType: string; // Added postType parameter
  onReset: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({ slides, postCode, postType, onReset }) => {
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
      // Generate ZIP filename based on postType
      let zipFilename = postCode;
      
      // Only append type for non-'new' post types (repost, drop, etc.)
      if (postType && postType !== 'New') {
        zipFilename = `${postCode}-${postType}`;
      }

      // Prepare images data for zip creation - keep original naming logic for images
      const imagesData = slidesWithImages.map((slide) => {
        const slideType = slide.type === 'thumbnail' ? 'thumbnail' : `detail-${slide.detailsType || 'other'}`;
        const slideIndex = slides.indexOf(slide);
        const isThumbnail = slideIndex === 0 || slide.type === 'thumbnail';
        
        return { 
          imageUrl: slide.imageUrl, 
          fileName: `${postCode}-${slideType}-${slideIndex}`, // Keep original naming for files inside ZIP
          applyMasking: !isThumbnail // Only apply masking to non-thumbnail images
        };
      });

      // Call API to create and download zip
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: imagesData,
          postCode: zipFilename // For the ZIP file name only
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create zip file');
      }

      // Get the blob from the response
      const blob = await response.blob();
      
      // Create a download link and trigger download
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${zipFilename}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Cleanup the object URL
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
      }, 100);

      toast.success(`Post images downloaded successfully`, {
        description: `Saved as ${zipFilename}.zip`,
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to download images", {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      // Reset download state
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 500);
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
            title="Download all slide images as ZIP"
        >
            <Download size={24} />
        </Button>
      </div>

      {/* Progress overlay */}
      {isDownloading && (
        <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50 animate-fade-in">
          <div className="bg-background p-8 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-center">Creating ZIP Archive</h2>
            <Progress value={downloadProgress} className="h-2 mb-2" />
            <p className="text-center text-muted-foreground">Please wait...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasHeader;