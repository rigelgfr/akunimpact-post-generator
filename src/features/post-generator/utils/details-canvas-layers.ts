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

// Render landscape mobile images
const renderLandscapeMobileImages = (
  ctx: CanvasRenderingContext2D,
  images: HTMLImageElement[],
  canvasWidth: number,
  availableHeight: number,
  topOffset: number
) => {
  const count = images.length;
  const padding = 10; // Padding between images
  
  // Calculate height per image (with padding between)
  const totalPaddingHeight = (count - 1) * padding;
  const heightPerImage = (availableHeight - totalPaddingHeight) / count;
  
  images.forEach((img, index) => {
    const aspectRatio = img.width / img.height;
    
    // Calculate dimensions while maintaining aspect ratio
    let drawHeight = heightPerImage;
    let drawWidth = drawHeight * aspectRatio;
    
    // If width exceeds canvas width, adjust
    if (drawWidth > canvasWidth * 0.9) {
      drawWidth = canvasWidth * 0.9;
      drawHeight = drawWidth / aspectRatio;
    }
    
    // Center the image horizontally
    const x = (canvasWidth - drawWidth) / 2;
    
    // Calculate vertical position with padding
    const y = topOffset + (index * (heightPerImage + padding)) + (heightPerImage - drawHeight) / 2;
    
    // Draw the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
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
  const padding = 15; // Padding between images
  
  // Calculate height per image (with padding between)
  const totalPaddingHeight = (count - 1) * padding;
  const heightPerImage = (availableHeight - totalPaddingHeight) / count;
  
  images.forEach((img, index) => {
    const aspectRatio = img.width / img.height;
    
    // Calculate dimensions while maintaining aspect ratio
    let drawHeight = heightPerImage;
    let drawWidth = drawHeight * aspectRatio;
    
    // If width exceeds canvas width, adjust
    if (drawWidth > canvasWidth) {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / aspectRatio;
    }
    
    // Center the image horizontally
    const x = (canvasWidth - drawWidth) / 2;
    
    // Calculate vertical position with padding
    const y = topOffset + (index * (heightPerImage + padding)) + (heightPerImage - drawHeight) / 2;
    
    // Draw the image
    ctx.drawImage(img, x, y, drawWidth, drawHeight);
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
    
    // Validate images are of the same type
    if (!validateImageSet(loadedImages)) {
      console.error("Images must be of the same type, and the number of images must be valid for that type");
      return;
    }
    
    // Define the available area for images
    const topOffset = 85;
    const availableHeight = 1213;
    
    // Determine image type of the set
    const imageType = getImageType(loadedImages[0]);
    
    // Render based on image type
    switch (imageType) {
      case 'portrait-mobile':
        renderPortraitMobileImages(ctx, loadedImages, canvasWidth, availableHeight, topOffset);
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
    
  } catch (error) {
    console.error("Error rendering user images:", error);
  }
};