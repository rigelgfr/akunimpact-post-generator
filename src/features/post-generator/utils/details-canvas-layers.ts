import { getImageType, preloadImage, validateImageSet } from "./image-utils";

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
  
// Render portrait mobile images
const renderPortraitMobileImages = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  availableHeight: number,
  topOffset: number
) => {
  const count = images.length;
  
  // Portrait mobile images always take half width of canvas
  const imageWidth = count === 1 ? canvasWidth / 2 : canvasWidth / count;
  const imageHeight = availableHeight;
  
  images.forEach((img, index) => {
    const aspectRatio = img.width / img.height;
    
    // Calculate dimensions while maintaining aspect ratio
    let drawWidth = imageWidth;
    let drawHeight = drawWidth / aspectRatio;
    
    // If height is less than available height, adjust to fill
    if (drawHeight < imageHeight) {
      drawHeight = imageHeight;
      drawWidth = drawHeight * aspectRatio;
    }
    
    // Center the image horizontally within its allocated space
    const x = count === 1 
      ? (canvasWidth - drawWidth) / 2 
      : index * imageWidth + (imageWidth - drawWidth) / 2;
    
    // Calculate vertical position to center or crop as needed
    const y = topOffset - (drawHeight - imageHeight) / 2;
    
    // Draw the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
  });
};

// Render portrait desktop images
const renderPortraitDesktopImages = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  availableHeight: number,
  topOffset: number
) => {
  // Only use the first image since portrait-desktop is limited to 1
  const img = images[0];
  const aspectRatio = img.width / img.height;
  
  // Use full height and calculate width maintaining aspect ratio
  const drawHeight = availableHeight;
  const drawWidth = drawHeight * aspectRatio;
  
  // Center horizontally
  const x = (canvasWidth - drawWidth) / 2;
  
  // Position at top offset
  ctx.drawImage(img, x, topOffset, drawWidth, drawHeight);
};

// Render landscape mobile images
const renderLandscapeMobileImages = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  availableHeight: number,
  topOffset: number
) => {
  const count = images.length;
  
  // Define an interface for the dimensions
  interface ImageDimension {
    width: number;
    height: number;
  }
  
  // First, calculate total height needed for all images at full scale
  let totalHeight = 0;
  const originalDimensions: ImageDimension[] = [];
  
  // Calculate original scaled dimensions for each image
  images.forEach((img) => {
    const aspectRatio = img.width / img.height;
    const drawWidth = canvasWidth;
    const drawHeight = drawWidth / aspectRatio;
    
    originalDimensions.push({ width: drawWidth, height: drawHeight });
    totalHeight += drawHeight;
  });
  
  // Calculate scaling factor if total height exceeds available height
  const scalingFactor = totalHeight > availableHeight ? availableHeight / totalHeight : 1;
  
  // Apply scaling factor to all images equally
  const scaledDimensions = originalDimensions.map(dim => ({
    width: dim.width,
    height: dim.height * scalingFactor
  }));
  
  // Calculate new total height
  const newTotalHeight = scaledDimensions.reduce((sum, dim) => sum + dim.height, 0);
  
  // Calculate starting Y to center the entire group
  let startY = topOffset + (availableHeight - newTotalHeight) / 2;
  
  // Draw each image with the same trimming approach
  images.forEach((img, index) => {
    const originalHeight = originalDimensions[index].height;
    const drawWidth = scaledDimensions[index].width;
    const drawHeight = scaledDimensions[index].height;
    
    // Center horizontally
    const x = (canvasWidth - drawWidth) / 2;
    
    // Calculate source rectangle for equal top/bottom trimming
    // The trim percentage is the same for all images
    const trimPercentage = (1 - scalingFactor) / 2;
    
    // Calculate source coordinates
    const sourceY = img.height * trimPercentage;
    const sourceHeight = img.height * (1 - 2 * trimPercentage);
    
    // Draw only the middle portion of each image
    ctx.drawImage(
      img,
      0, sourceY, img.width, sourceHeight,
      x, startY, drawWidth, drawHeight
    );
    
    // Move to next position with no gap
    startY += drawHeight;
  });
};

// Render landscape desktop images
const renderLandscapeDesktopImages = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  availableHeight: number,
  topOffset: number
) => {
  const count = images.length;
  
  // First, calculate total height needed for all images
  let totalHeight = 0;
  const scaledHeights = [];
  
  // Calculate scaled dimensions for each image
  images.forEach((img) => {
    const aspectRatio = img.width / img.height;
    
    // Use full canvas width - no margins
    const drawWidth = canvasWidth;
    const drawHeight = drawWidth / aspectRatio;
    
    scaledHeights.push(drawHeight);
    totalHeight += drawHeight;
  });
  
  // Calculate starting Y to center the entire group
  let startY = topOffset + (availableHeight - totalHeight) / 2;
  
  // Draw images with no gaps
  images.forEach((img, index) => {
    const aspectRatio = img.width / img.height;
    const drawWidth = canvasWidth;
    const drawHeight = drawWidth / aspectRatio;
    
    // No horizontal centering - use full width
    const x = 0;
    
    // Draw at current position with no gap
    ctx.drawImage(img, x, startY, drawWidth, drawHeight);
    
    // Move to next position with absolutely no gap
    startY += drawHeight;
  });
};

// Main render function
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
    
    // Validate images are of the same type or mixed landscapes
    if (!validateImageSet(loadedImages)) {
      console.error("Images must be of the same type or mixed landscapes, and the number of images must be valid");
      return;
    }
    
    // Define the available area for images
    const topOffset = 82;
    const availableHeight = 1215;
    
    // Check if we have mixed landscapes
    const firstType = getImageType(loadedImages[0]);
    const isAllSameType = loadedImages.every(img => getImageType(img) === firstType);
    const isMixedLandscapes = loadedImages.every(img => {
      const type = getImageType(img);
      return type === 'landscape-mobile' || type === 'landscape-desktop';
    }) && !isAllSameType;
    
    if (isMixedLandscapes) {
      // Render mixed landscapes similarly to landscape desktop (stacked with no gaps)
      renderLandscapeDesktopImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
    } else {
      // Render based on image type using existing functions
      switch (firstType) {
        case 'portrait-mobile':
          renderPortraitMobileImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
          break;
        case 'portrait-desktop':
          renderPortraitDesktopImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
          break;
        case 'landscape-mobile':
          renderLandscapeMobileImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
          break;
        case 'landscape-desktop':
          renderLandscapeDesktopImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
          break;
        default:
          console.error("Unknown image type");
      }
    }
    
  } catch (error) {
    console.error("Error rendering user images:", error);
  }
};