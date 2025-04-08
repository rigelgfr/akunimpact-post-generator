import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import {
    getClientSession,
    preprocessImageForClient,
    processOutput,
    DetectionBox
} from '@/utils/client-model-utils';
import { Tensor } from 'onnxruntime-web';

interface CanvasHeaderProps {
  slides: Array<{
    id: string;
    type: string;
    imageUrl: string | null;
    detailsType?: "char" | "item" | "const" | "info" | "other";
  }>;
  postCode: string;
  postType: string;
  onReset: () => void;
}

const CanvasHeader: React.FC<CanvasHeaderProps> = ({ slides, postCode, postType, onReset }) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Function to detect objects in an image and apply masking
  const detectAndMaskImage = useCallback(async (imageUrl: string, maskColor: string = '#4086a2'): Promise<string> => {
    try {
      // 1. Load image from URL or base64
      let imageBlob: Blob;
      
      if (imageUrl.startsWith('data:')) {
        // Convert base64 to blob
        const fetchResponse = await fetch(imageUrl);
        imageBlob = await fetchResponse.blob();
      } else {
        // Fetch from URL
        const fetchResponse = await fetch(imageUrl);
        if (!fetchResponse.ok) {
          throw new Error(`Failed to fetch image: ${fetchResponse.statusText}`);
        }
        imageBlob = await fetchResponse.blob();
      }
      
      // Convert blob to file for processing
      const imageFile = new File([imageBlob], "image.png", { type: imageBlob.type });
      
      // 2. Get model session
      const session = await getClientSession();
      
      // 3. Preprocess the image
      const { tensor, originalWidth, originalHeight, padInfo } = await preprocessImageForClient(imageFile);
      
      // 4. Run inference
      const feeds: Record<string, Tensor> = {};
      feeds[session.inputNames[0]] = tensor;
      const results = await session.run(feeds);
      const outputTensor = results[session.outputNames[0]];
      if (!outputTensor) throw new Error('Output tensor not found in results');
      
      // 5. Process output to get detections
      const detectedBoxes: DetectionBox[] = processOutput(outputTensor, originalWidth, originalHeight, padInfo);
      
      // 6. Draw mask on image using Canvas
      const image = new Image();
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = imageUrl;
      });
      
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Draw original image
      ctx.drawImage(image, 0, 0);
      
      // Apply masking for each detection
      if (detectedBoxes.length > 0) {
        ctx.fillStyle = maskColor;
        
        for (const box of detectedBoxes) {
          const x = box.x1;
          const y = box.y1;
          const width = box.x2 - box.x1;
          const height = box.y2 - box.y1;
          
          // Create rectangle with some transparency
          ctx.fillRect(x, y, width, height);
        }
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
      }
      
      // Convert canvas to base64
      const maskedImageBase64 = canvas.toDataURL('image/png');
      return maskedImageBase64;
      
    } catch (error) {
      console.error('Error in client-side object detection:', error);
      // Return original image if detection fails
      return imageUrl;
    }
  }, []);

  const downloadAllImages = async () => {
    // Filter out slides with no imageUrl
    const slidesWithImages = slides.filter(slide => slide.imageUrl);
    
    if (slidesWithImages.length === 0 || isDownloading) {
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    const totalSteps = slidesWithImages.length;
    let currentStep = 0;

    try {
      // Generate ZIP filename based on postType
      let zipFilename = postCode;
      
      // Only append type for non-'new' post types
      if (postType && postType !== 'New') {
        zipFilename = `${postCode}-${postType}`;
      }

      // Process each image - applying masking when needed
      const processedImages = [];
      
      for (const slide of slidesWithImages) {
        const slideType = slide.type === 'thumbnail' ? 'thumbnail' : `detail-${slide.detailsType || 'other'}`;
        const slideIndex = slides.indexOf(slide);
        const isThumbnail = slideIndex === 0 || slide.type === 'thumbnail';
        let imageUrl = slide.imageUrl;
        
        // Apply client-side detection and masking to non-thumbnail images
        if (!isThumbnail && imageUrl) {
          try {
            // Process image with client-side detection
            imageUrl = await detectAndMaskImage(imageUrl, '#4086a2');
          } catch (maskError) {
            console.error('Error applying client-side masking:', maskError);
            // Continue with original image if masking fails
          }
        }
        
        processedImages.push({
          imageUrl,
          fileName: `${postCode}-${slideType}-${slideIndex}`
        });
        
        // Update progress
        currentStep++;
        setDownloadProgress(Math.round((currentStep / totalSteps) * 100));
      }

      // Now create zip with processed images - using existing API endpoint
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          images: processedImages,
          postCode: zipFilename
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create zip file');
      }

      // Check the content type to determine response format
      const contentType = response.headers.get('Content-Type');
      
      if (contentType && contentType.includes('application/json')) {
        // Handle JSON response (for mobile)
        const result = await response.json();
        
        if (result.success && result.data) {
          // Convert base64 to blob
          const byteCharacters = atob(result.data);
          const byteArrays = [];
          
          for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
            }
            
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
          }
          
          const blob = new Blob(byteArrays, { type: 'application/zip' });
          const downloadUrl = URL.createObjectURL(blob);
          
          // Create download link
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${zipFilename}.zip`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          
          // Cleanup
          setTimeout(() => {
            URL.revokeObjectURL(downloadUrl);
          }, 100);
        } else if (result.error) {
          throw new Error(result.error);
        }
      } else {
        // Handle binary response (for desktop)
        const blob = await response.blob();
        const downloadUrl = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${zipFilename}.zip`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        // Cleanup
        setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 100);
      }

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
      <div className="lg:absolute lg:right-0 flex justify-end p-2 text-ai-cyan text-5xl">
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
            <p className="text-center text-muted-foreground">Processing image {downloadProgress}%</p>
          </div>
        </div>
      )}
    </>
  );
};

export default CanvasHeader;