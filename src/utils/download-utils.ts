// utils/download-utils.ts
import JSZip from 'jszip';

/**
 * Downloads a single image to the user's device
 */
export const downloadSingleImage = async (imageUrl: string, fileName: string): Promise<void> => {
  // For base64 images
  if (imageUrl.startsWith('data:')) {
    // Create a link element
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${fileName}.png`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    
    // Small delay before removing the element
    await new Promise(resolve => setTimeout(resolve, 100));
    document.body.removeChild(a);
    return;
  }
  
  // For URL images, fetch first
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.png`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  
  // Small delay before cleaning up
  await new Promise(resolve => setTimeout(resolve, 100));
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Creates and downloads a ZIP file containing multiple images
 */
export const createAndDownloadZip = async (
  images: Array<{imageUrl: string, fileName: string}>, 
  zipFilename: string
): Promise<void> => {
  const zip = new JSZip();
  
  // Process each image
  for (const { imageUrl, fileName } of images) {
    if (!imageUrl) continue;
    
    try {
      // For base64 images
      if (imageUrl.startsWith('data:')) {
        const base64Data = imageUrl.split(',')[1];
        zip.file(`${fileName}.png`, base64Data, {base64: true});
      } else {
        // For URL images, fetch first
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        zip.file(`${fileName}.png`, blob);
      }
    } catch (err) {
      console.error(`Error processing image ${fileName}:`, err);
      // Continue with other images
    }
  }
  
  // Generate and download the zip
  const content = await zip.generateAsync({type: 'blob'});
  const url = URL.createObjectURL(content);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${zipFilename}.zip`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Detects if the user is on a mobile device
 */
export const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};