// In a new file: utils/image-upload.ts

/**
 * Handles file uploads and returns URLs for preview
 */
export const handleImageUpload = async (files: FileList): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    // For each file, create a URL for preview
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Only process image files
      if (!file.type.startsWith('image/')) continue;
      
      // Create a URL for the file
      const imageUrl = URL.createObjectURL(file);
      uploadedUrls.push(imageUrl);
      
      // In a real app, you'd upload the file to a server here
      // const formData = new FormData();
      // formData.append('image', file);
      // const response = await fetch('/api/upload', { method: 'POST', body: formData });
      // const data = await response.json();
      // uploadedUrls.push(data.imageUrl);
    }
    
    return uploadedUrls;
  };
  
  /**
   * Revokes object URLs to prevent memory leaks
   */
  export const revokeImageUrls = (urls: string[]) => {
    urls.forEach(url => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  };