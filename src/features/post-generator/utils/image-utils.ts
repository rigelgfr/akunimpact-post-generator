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