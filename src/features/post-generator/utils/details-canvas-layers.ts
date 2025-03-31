import { preloadImage } from "./image-utils";

export const renderDetailOverlay = async (
    ctx: CanvasRenderingContext2D,
    overlayType: string,
    canvasWidth: number,
    canvasHeight: number,
    renderID: number,
    currentRenderID: number
  ) => {
    if (currentRenderID !== renderID) return;
  
    try {
      const overlayPath = `/assets/post-generator/overlay/details/${overlayType}.webp`;
      const overlayImage = await preloadImage(overlayPath);
      if (currentRenderID !== renderID) return;
      
      ctx.drawImage(overlayImage, 0, 0, canvasWidth, canvasHeight);
    } catch (error) {
      console.error(`Error loading overlay for type ${overlayType}:`, error);
    }
  };
  
  // Render user uploaded images
  export const renderUserImages = async (
    ctx: CanvasRenderingContext2D,
    images: string[],
    canvasWidth: number,
    canvasHeight: number,
    renderID: number,
    currentRenderID: number
  ) => {
    if (currentRenderID !== renderID) return;
    
    // Determine layout based on number of images
    const imageCount = images.length;
    
    // For simplicity, just center the first image if multiple
    // In a real implementation, you'd have different layouts based on count
    try {
      const mainImage = await preloadImage(images[0]);
      if (currentRenderID !== renderID) return;
      
      // Center the image
      const aspectRatio = mainImage.width / mainImage.height;
      let drawWidth, drawHeight;
      
      // Calculate size to fit within boundaries while maintaining aspect ratio
      const maxWidth = canvasWidth * 0.85;  // 85% of canvas width
      const maxHeight = canvasHeight * 0.6; // 60% of canvas height
      
      if (aspectRatio > 1) {
        // Landscape image
        drawWidth = Math.min(maxWidth, mainImage.width);
        drawHeight = drawWidth / aspectRatio;
      } else {
        // Portrait image
        drawHeight = Math.min(maxHeight, mainImage.height);
        drawWidth = drawHeight * aspectRatio;
      }
      
      // Center the image
      const x = (canvasWidth - drawWidth) / 2;
      const y = (canvasHeight - drawHeight) / 2;
      
      ctx.drawImage(mainImage, x, y, drawWidth, drawHeight);
      
      // If there are more images, you'd render them based on a layout
      // This is simplified for now
    } catch (error) {
      console.error("Error rendering user images:", error);
    }
  };