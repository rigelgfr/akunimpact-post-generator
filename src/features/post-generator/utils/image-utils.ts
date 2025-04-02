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