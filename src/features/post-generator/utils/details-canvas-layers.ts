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
    
    const imageCount = images.length;
    if (imageCount === 0) return;
    
    try {
      // Load all images first
      const loadedImages = await Promise.all(
        images.map(url => preloadImage(url))
      );
      
      if (currentRenderID !== renderID) return;
      
      // Simple grid layout based on number of images
      if (imageCount === 1) {
        // Single image - center it
        const img = loadedImages[0];
        const aspectRatio = img.width / img.height;
        let drawWidth, drawHeight;
        
        // Calculate size to fit within boundaries while maintaining aspect ratio
        const maxWidth = canvasWidth * 0.85;  // 85% of canvas width
        const maxHeight = canvasHeight * 0.6; // 60% of canvas height
        
        if (aspectRatio > 1) {
          // Landscape image
          drawWidth = Math.min(maxWidth, img.width);
          drawHeight = drawWidth / aspectRatio;
        } else {
          // Portrait image
          drawHeight = Math.min(maxHeight, img.height);
          drawWidth = drawHeight * aspectRatio;
        }
        
        // Center the image
        const x = (canvasWidth - drawWidth) / 2;
        const y = (canvasHeight - drawHeight) / 2;
        
        ctx.drawImage(img, x, y, drawWidth, drawHeight);
      } 
      else {
        // Multiple images - create a simple grid
        const gridArea = {
          width: canvasWidth * 0.85,
          height: canvasHeight * 0.6,
          x: canvasWidth * 0.075,
          y: canvasHeight * 0.2
        };
        
        // Calculate grid dimensions
        let cols = Math.ceil(Math.sqrt(imageCount));
        let rows = Math.ceil(imageCount / cols);
        
        // Calculate cell size
        const cellWidth = gridArea.width / cols;
        const cellHeight = gridArea.height / rows;
        const cellPadding = 10; // Padding between images
        
        // Draw each image
        loadedImages.forEach((img, index) => {
          if (currentRenderID !== renderID) return;
          
          // Calculate position in grid
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Calculate position and size
          const aspectRatio = img.width / img.height;
          let drawWidth, drawHeight;
          
          // Calculate size to fit cell with padding
          const maxCellWidth = cellWidth - (cellPadding * 2);
          const maxCellHeight = cellHeight - (cellPadding * 2);
          
          if (aspectRatio > 1) {
            // Landscape image
            drawWidth = maxCellWidth;
            drawHeight = drawWidth / aspectRatio;
            // If height exceeds cell height, adjust
            if (drawHeight > maxCellHeight) {
              drawHeight = maxCellHeight;
              drawWidth = drawHeight * aspectRatio;
            }
          } else {
            // Portrait image
            drawHeight = maxCellHeight;
            drawWidth = drawHeight * aspectRatio;
            // If width exceeds cell width, adjust
            if (drawWidth > maxCellWidth) {
              drawWidth = maxCellWidth;
              drawHeight = drawWidth / aspectRatio;
            }
          }
          
          // Calculate position to center in cell
          const x = gridArea.x + (col * cellWidth) + ((cellWidth - drawWidth) / 2);
          const y = gridArea.y + (row * cellHeight) + ((cellHeight - drawHeight) / 2);
          
          // Draw the image
          ctx.drawImage(img, x, y, drawWidth, drawHeight);
        });
      }
    } catch (error) {
      console.error("Error rendering user images:", error);
    }  
  };