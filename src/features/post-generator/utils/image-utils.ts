// Cache for preloaded images
export const imageCache: Record<string, HTMLImageElement> = {};

// Function to preload and cache images
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  if (imageCache[src]) {
    return Promise.resolve(imageCache[src]);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
  });
};

export const handleClipboardImage = (event: ClipboardEvent): Promise<string | null> => {
  return new Promise((resolve) => {
    // Check if there are items in the clipboard
    if (!event.clipboardData || !event.clipboardData.items) {
      resolve(null);
      return;
    }
    
    // Look for image items
    const items = event.clipboardData.items;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        // Get the blob
        const blob = items[i].getAsFile();
        
        if (!blob) {
          resolve(null);
          return;
        }
        
        // Create an object URL from the blob
        const imageUrl = URL.createObjectURL(blob);
        resolve(imageUrl);
        return;
      }
    }
    
    // No image found
    resolve(null);
  });
};

// Helper function to determine image type
export const getImageType = (img: HTMLImageElement): 'portrait-mobile' | 'portrait-desktop' | 'landscape-mobile' | 'landscape-desktop' => {
  const aspectRatio = img.width / img.height;
  
  if (aspectRatio < 0.5) {
    return 'portrait-mobile';
  } else if (aspectRatio >= 0.5 && aspectRatio < 0.8) {
    return 'portrait-desktop';
  } else if (aspectRatio >= 2 && aspectRatio <= 2.4) { // Increased to capture your 2.27 mobile ratio
    return 'landscape-mobile';
  } else {
    return 'landscape-desktop';
  }
};

// Helper function to validate images are of the same type
export const validateImageSet = (images: HTMLImageElement[]): boolean => {
  if (images.length === 0) return true;
  
  const firstType = getImageType(images[0]);
  
  // Check if all images are of the same type
  const allSameType = images.every(img => getImageType(img) === firstType);
  
  // New condition: Check if images are mixed landscapes
  const allLandscapes = images.every(img => {
    const type = getImageType(img);
    return type === 'landscape-mobile' || type === 'landscape-desktop';
  });
  
  // Debug: Log types and aspect ratios
  images.forEach((img, index) => {
    const ratio = img.width / img.height;
    const type = getImageType(img);
    console.log(`Image ${index}: Type = ${type}, Aspect Ratio = ${ratio}`);
  });
  
  // Check if number of images is valid for the type
  if ((firstType === 'portrait-mobile' && images.length > 2) ||
      (firstType === 'portrait-desktop' && images.length > 1)){
    return false;
  }
  
  // Original landscape type validation
  if ((firstType === 'landscape-mobile' && images.length > 3 && allSameType) ||
      (firstType === 'landscape-desktop' && images.length > 2 && allSameType)) {
    return false;
  }
  
  // Mixed landscape validation: limit to 2 images
  if (allLandscapes && !allSameType && images.length > 2) {
    return false;
  }
  
  return allSameType || allLandscapes;
};