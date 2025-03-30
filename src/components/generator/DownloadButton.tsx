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

      // Show success toast with custom styling
      toast.success("Image saved successfully", {
        description: `Saved to posts/${result.path}`,
        action: {
          label: "Open Folder",
          onClick: () => openFolder(result.path.split('/').slice(0, -1).join('/')),
        },
        className: "default"
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast.error("Failed to save image", {
        description: error instanceof Error ? error.message : String(error),
        style: {
          backgroundColor: 'var(--theme-error-dark, #7f1d1d)',
          color: 'var(--theme-error-light, #fef2f2)',
          border: '1px solid var(--theme-error-muted, #b91c1c)'
        },
        className: "my-custom-error-toast"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Function to open the folder in file explorer
  const openFolder = async (folderPath: string) => {
    try {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: folderPath }),
      });
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
        className="w-full max-w-sm"
      >
        <Download className="mr-2 h-4 w-4" />
        {isDownloading ? 'Saving...' : 'Save Image'}
      </Button>
      
      <button
        onClick={() => openFolder('posts')}
        className="text-sm text-blue-500 hover:underline flex items-center justify-center"
        type="button"
      >
        <Folder className="mr-1 h-3 w-3" />
        Open posts folder
      </button>
    </div>
  );
};

export default DownloadButton;