import { Characters } from '../data/characters';
import { GameBackground, GameFade } from '../data/game-bg-fade';
import { ThumbnailOverlay } from '../data/overlay';
import { Footer } from '../data/footer';
import { preloadImage } from './image-utils';
import { calculateFinalPrice } from './markup';

export interface CanvasRenderProps {
    canvas: HTMLCanvasElement;
    canvasWidth: number;
    canvasHeight: number;
    postType: string;
    selectedGames: string[];
    selectedCharacters: { [key: string]: string };
    getCharacterImageIndex: () => number;
    currentRenderID: number;
    setCurrentRenderID: (id: number) => void;
    onComplete: (imageUrl: string | null) => void;
    netPrice: string;
    isStarterAccount: boolean;
}

export const renderCanvasLayers = async ({
  canvas,
  canvasWidth,
  canvasHeight,
  postType,
  selectedGames,
  selectedCharacters,
  getCharacterImageIndex,
  currentRenderID,
  setCurrentRenderID,
  onComplete,
  netPrice,
  isStarterAccount
}: CanvasRenderProps) => {
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

    // Layer 7: Price Text
    if (netPrice) {
        await renderPriceText(bufferCtx, netPrice, isStarterAccount, canvasWidth, canvasHeight, renderID, currentRenderID);
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

async function renderGameBackground(
  ctx: CanvasRenderingContext2D, 
  selectedGames: string[], 
  canvasWidth: number, 
  canvasHeight: number,
  renderID: number,
  currentRenderID: number
) {
  const bgKey = selectedGames.length === 1 
    ? 'single' 
    : selectedGames.length === 2 
      ? 'double' 
      : 'all';
  
  const bgSubKey = selectedGames.length === 1 
    ? selectedGames[0] 
    : selectedGames.length === 2 
      ? selectedGames.sort().join('_')
      : 'all';

  if (GameBackground[bgKey] && GameBackground[bgKey][bgSubKey]) {
    const gameBgImage = await preloadImage(GameBackground[bgKey][bgSubKey].background);
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    ctx.drawImage(gameBgImage, 0, 0, canvasWidth, canvasHeight);
  }
}

async function renderCharacters(
  ctx: CanvasRenderingContext2D, 
  selectedGames: string[], 
  selectedCharacters: { [key: string]: string },
  getCharacterImageIndex: () => number,
  canvasWidth: number, 
  canvasHeight: number,
  renderID: number,
  currentRenderID: number
) {
  const characterImageIndex = getCharacterImageIndex();
  for (const game of selectedGames) {
    if (selectedCharacters[game]) {
      const characterData = Characters[game][selectedCharacters[game]];
      const characterImage = await preloadImage(
        characterData.images[characterImageIndex]
      );
      
      if (currentRenderID !== renderID) return; // Check if we should continue rendering

      // Special handling for HSR in multi-game scenarios
      if (game === 'hsr' && selectedGames.length === 2) {
        const otherGame = selectedGames.find(g => g !== 'hsr');
        const isHSRLeft = otherGame === 'zzz';
        
        if (isHSRLeft) {
          // Position HSR character on left half
          ctx.drawImage(characterImage, 540, 0, 540, 1350);
        } else {
          // Position HSR character on right half
          ctx.drawImage(characterImage, 0, 0, 540, 1350);
        }
      } else {
        // Default full canvas drawing
        ctx.drawImage(characterImage, 0, 0, canvasWidth, canvasHeight);
      }
    }
  }
}

async function renderGameFade(
  ctx: CanvasRenderingContext2D, 
  selectedGames: string[], 
  canvasWidth: number, 
  canvasHeight: number,
  renderID: number,
  currentRenderID: number
) {
  const fadeKey = selectedGames.length === 1 
    ? 'single' 
    : selectedGames.length === 2 
      ? 'double' 
      : 'all';
  
  const fadeSubKey = selectedGames.length === 1 
    ? selectedGames[0] 
    : selectedGames.length === 2 
      ? selectedGames.sort().join('_')
      : 'all';

  if (GameFade[fadeKey] && GameFade[fadeKey][fadeSubKey]) {
    const gameFadeImage = await preloadImage(GameFade[fadeKey][fadeSubKey].background);
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    ctx.drawImage(gameFadeImage, 0, 0, canvasWidth, canvasHeight);
  }
}

async function renderOverlay(
  ctx: CanvasRenderingContext2D, 
  selectedGames: string[], 
  postType: string,
  canvasWidth: number, 
  canvasHeight: number,
  renderID: number,
  currentRenderID: number
) {
  const overlayKey = selectedGames.length === 1 
    ? 'single' 
    : selectedGames.length === 2 
      ? 'double' 
      : 'all';

  // Determine overlay image index based on number of games
  const overlayImageIndex = selectedGames.length === 1 
    ? 0 
    : selectedGames.length === 2 
      ? 1 
      : 2;

  if (ThumbnailOverlay[overlayKey] && ThumbnailOverlay[overlayKey][postType.toLowerCase()]) {
    const originalOverlay = ThumbnailOverlay[overlayKey][postType.toLowerCase()].overlay;
    const modifiedOverlay = originalOverlay.replace(
      /overlay_([^_]+)_[^.]+\.webp/, 
      `overlay_$1_${overlayImageIndex + 1}.webp`
    );

    const overlayImage = await preloadImage(modifiedOverlay);
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    ctx.drawImage(overlayImage, 0, 0, canvasWidth, canvasHeight);
  }
}

async function renderFooter(
  ctx: CanvasRenderingContext2D, 
  postType: string,
  canvasWidth: number, 
  canvasHeight: number,
  renderID: number,
  currentRenderID: number
) {
  if (Footer[postType.toLowerCase()]) {
    const footerImage = await preloadImage(Footer[postType.toLowerCase()].footer);
    if (currentRenderID !== renderID) return; // Check if we should continue rendering
    ctx.drawImage(footerImage, 0, 0, canvasWidth, canvasHeight);
  }
}

async function renderPriceText(
    ctx: CanvasRenderingContext2D,
    netPrice: string,
    isStarterAccount: boolean,
    canvasWidth: number,
    canvasHeight: number,
    renderID: number,
    currentRenderID: number
  ) {
    if (currentRenderID !== renderID) return;
    
    // Load the custom font
    const fontFace = new FontFace('Sifonn', 'url(/font/sifonn-basic.otf)');
    
    try {
      // Load the font
      await fontFace.load();
      document.fonts.add(fontFace);
      
      if (currentRenderID !== renderID) return;
      
      // Calculate the final price
      const finalPrice = calculateFinalPrice(netPrice, isStarterAccount);
      
      // Set the text style
      ctx.font = '48px Sifonn';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Position the text (centered horizontally, near the top)
      const textX = canvasWidth / 2;
      const textY = 895; // Adjust this value as needed for vertical positioning
      
      // Draw the text
      ctx.fillText(finalPrice, textX, textY);
      
    } catch (error) {
      console.error("Error loading font or rendering price:", error);
      
      // Fallback to a system font if custom font fails to load
      if (currentRenderID === renderID) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        const finalPrice = calculateFinalPrice(netPrice, isStarterAccount);
        ctx.fillText(finalPrice, canvasWidth / 2, 50);
      }
    }
}