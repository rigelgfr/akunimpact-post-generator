import { preloadImage } from './image-utils';
import { renderGameBackground, renderCharacters, renderGameFade, renderOverlay, renderFooter, renderPostCode, renderPriceText, renderPostDescription } from './thumbnail-canvas-layers';
import { renderDetailOverlay, renderUserImages } from './details-canvas-layers';

export interface CanvasThumbnailRenderProps {
    canvas: HTMLCanvasElement;
    canvasWidth: number;
    canvasHeight: number;
    postType: string;
    postCode: string;
    selectedGames: string[];
    selectedCharacters: { [key: string]: string };
    getCharacterImageIndex: () => number;
    netPrice: string;
    isStarterAccount: boolean;
    currentRenderID: number;
    setCurrentRenderID: (id: number) => void;
    onComplete: (imageUrl: string | null) => void;
    postDescription: string;
}

export const renderCanvasThumbnailLayers = async ({
  canvas,
  canvasWidth,
  canvasHeight,
  postType,
  postCode,
  selectedGames,
  selectedCharacters,
  getCharacterImageIndex,
  netPrice,
  isStarterAccount,
  postDescription,
  currentRenderID,
  setCurrentRenderID,
  onComplete,
}: CanvasThumbnailRenderProps) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const renderID = Date.now();
  setCurrentRenderID(renderID);

  // Create a buffer canvas for double buffering
  const buffer = document.createElement('canvas');
  buffer.width = canvasWidth;
  buffer.height = canvasHeight;
  const bufferCtx = buffer.getContext('2d');
  
  if (!bufferCtx) return;
  
  try {
    // Clear buffer
    bufferCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Layer 1: Background (fixed)
    const bgImage = await preloadImage("/assets/post-generator/background/thumbnail_bg.webp");
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    bufferCtx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    
    // Layer 2: Game Background
    if (selectedGames && selectedGames.length > 0) {
      await renderGameBackground(bufferCtx, selectedGames, canvasWidth, canvasHeight, renderID, currentRenderID);
      if (currentRenderID !== renderID) return;
    }
    
    // Layer 3: Characters
    await renderCharacters(bufferCtx, selectedGames, selectedCharacters, getCharacterImageIndex, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;
    
    // Layer 4: Game Fade
    if (selectedGames && selectedGames.length > 0) {
      await renderGameFade(bufferCtx, selectedGames, canvasWidth, canvasHeight, renderID, currentRenderID);
      if (currentRenderID !== renderID) return;
    }
    
    // Layer 5: Overlay
    await renderOverlay(bufferCtx, selectedGames, postType, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;
    
    // Layer 6: Footer
    await renderFooter(bufferCtx, postType, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;

    // Layer 7: Post Code
    await renderPostCode(bufferCtx, postCode, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;

    // Layer 8: Price Text
    if (netPrice) {
        await renderPriceText(bufferCtx, netPrice, isStarterAccount, canvasWidth, canvasHeight, renderID, currentRenderID);
        if (currentRenderID !== renderID) return;
      }
    
    // Layer 9: Post Description
    if (postDescription) {
      await renderPostDescription(bufferCtx, postDescription, canvasWidth, canvasHeight, renderID, currentRenderID);
      if (currentRenderID !== renderID) return;
    }
    
    // Copy from buffer to main canvas (only when everything is ready)
    if (currentRenderID === renderID) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(buffer, 0, 0);
      
      // Generate final image URL
      const finalImageUrl = canvas.toDataURL("image/png");
      onComplete(finalImageUrl);
    }
  } catch (error) {
    console.error("Error rendering canvas:", error);
    if (currentRenderID === renderID) {
      onComplete(null);
    }
  }
};

export interface RenderDetailsLayersProps {
  canvas: HTMLCanvasElement;
  canvasWidth: number;
  canvasHeight: number;
  postType: string;
  overlayType: "char" | "item" | "const" | "info" | "other";
  images: string[];
  currentRenderID: number;
  setCurrentRenderID: (id: number) => void;
  onComplete: (imageUrl: string | null) => void;
}

export const renderDetailsLayers = async ({
  canvas,
  canvasWidth,
  canvasHeight,
  postType,
  overlayType,
  images,
  currentRenderID,
  setCurrentRenderID,
  onComplete,
}: RenderDetailsLayersProps) => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const renderID = Date.now();
  setCurrentRenderID(renderID);

  // Create a buffer canvas for double buffering
  const buffer = document.createElement('canvas');
  buffer.width = canvasWidth;
  buffer.height = canvasHeight;
  const bufferCtx = buffer.getContext('2d');
  
  if (!bufferCtx) return;
  
  try {
    // Clear buffer
    bufferCtx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Layer 1: Background (fixed)
    const bgImage = await preloadImage("/assets/post-generator/background/details_bg.webp");
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    bufferCtx.drawImage(bgImage, 0, 0, canvasWidth, canvasHeight);
    
    // Layer 2: Overlay based on type
    await renderDetailOverlay(bufferCtx, overlayType, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;
    
    // Layer 3: User Images
    if (images && images.length > 0) {
      await renderUserImages(bufferCtx, images, canvasWidth, canvasHeight, renderID, currentRenderID);
      if (currentRenderID !== renderID) return;
    }
    
    // Layer 4: Footer (same as thumbnail)
    await renderFooter(bufferCtx, postType, canvasWidth, canvasHeight, renderID, currentRenderID);
    if (currentRenderID !== renderID) return;
    
    // Copy from buffer to main canvas (only when everything is ready)
    if (currentRenderID === renderID) {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(buffer, 0, 0);
      
      // Generate final image URL
      const finalImageUrl = canvas.toDataURL("image/png");
      onComplete(finalImageUrl);
    }
  } catch (error) {
    console.error("Error rendering detail canvas:", error);
    if (currentRenderID === renderID) {
      onComplete(null);
    }
  }
};