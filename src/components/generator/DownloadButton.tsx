import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Folder } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  imageUrl: string;
  postCode: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ imageUrl, postCode }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const downloadImage = async () => {
    if (!imageUrl || isDownloading) return;
    setIsDownloading(true);
    
    try {
      // Call the simplified API route
      const response = await fetch('/api/save-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrl, postCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Server error: ${response.statusText}`);
      }

      // Show success toast without the Open Folder action
      toast.success("Image saved successfully", {
        description: `Saved to posts/${result.path}`,
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to save image", {
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
    <div className="flex flex-col space-y-3">
      <Button 
        onClick={downloadImage} 
        disabled={!imageUrl || isDownloading}
        variant="default"
        className="w-full max-w-sm bg-ai-cyan hover:bg-ai-cyan/80 text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? 'Saving...' : 'Save Image'}
      </Button>
      
      <Button
        onClick={openPostsFolder}
        className="text-sm text-ai-cyan hover:underline flex items-center justify-center"
        variant="link"
      >
        <Folder className="h-3 w-3" />
        Open posts folder
      </Button>
    </div>
  );
};

export default DownloadButton;