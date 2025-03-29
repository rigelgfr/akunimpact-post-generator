import { loadFont } from "@/utils/load-font";
import { GameBackground, GameFade } from "../data/game-bg-fade";
import { preloadImage } from "./image-utils";
import { Characters } from "../data/characters";
import { ThumbnailOverlay } from "../data/overlay";
import { Footer } from "../data/footer";
import { calculateFinalPrice } from "./markup";
import { Colors } from "@/data/colors";


export async function renderPostCode(
    ctx: CanvasRenderingContext2D,
    code: string,
    canvasWidth: number,
    canvasHeight: number,
    renderID: number,
    currentRenderID: number
  ) {
    if (currentRenderID !== renderID) return;
    
    await loadFont('Sifonn', '/font/sifonn-basic.otf');
    
    try {    
      if (currentRenderID !== renderID) return;
      
      // Set the text style
      ctx.font = '48px Sifonn';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Position the text (centered horizontally, near the top)
      const textX = canvasWidth / 2;
      const textY = 895; // Adjust this value as needed for vertical positioning
      
      // Draw the text
      ctx.fillText(code, textX, textY);
      
    } catch (error) {
      console.error("Error loading font or rendering price:", error);
      
      // Fallback to a system font if custom font fails to load
      if (currentRenderID === renderID) {
        ctx.font = '48px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        ctx.fillText(code, canvasWidth / 2, 50);
      }
    }
  }

export async function renderGameBackground(
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
  
export async function renderCharacters(
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
  
export async function renderGameFade(
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
  
export async function renderOverlay(
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
  
export async function renderFooter(
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
  
export async function renderPriceText(
ctx: CanvasRenderingContext2D,
netPrice: string,
isStarterAccount: boolean,
canvasWidth: number,
canvasHeight: number,
renderID: number,
currentRenderID: number
) {
if (currentRenderID !== renderID) return;

try {
    // Load the font
    await loadFont('Sifonn', '/font/sifonn-basic.otf');

    if (currentRenderID !== renderID) return;

    // Calculate the final price
    const finalPrice = calculateFinalPrice(netPrice, isStarterAccount);

    // --- Text Style Setup ---
    const fontSize = 133;
    const letterSpacing = 10; // 10px letter spacing as requested
    ctx.font = `${fontSize}px Sifonn`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position the text
    const textX = canvasWidth / 2;
    const textY = 1050;
    
    // --- Apply Advanced Neon Glow Effect ---
    // First measure the text to calculate total width with letter spacing
    const characters = finalPrice.split('');
    let totalWidth = 0;
    
    // Calculate the total width with letter spacing
    characters.forEach((char) => {
    totalWidth += ctx.measureText(char).width + letterSpacing;
    });
    totalWidth -= letterSpacing; // Remove extra spacing after last character
    
    // Draw each character with spacing and multiple layered glows
    const startX = textX - totalWidth / 2;
    let currentX = startX;
    
    // Layer 1: Outer glow (larger blur)
    ctx.shadowColor = Colors["default-blue"].color;
    ctx.shadowBlur = 50;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // Semi-transparent for glow layers
    
    // Draw characters with spacing for outer glow
    characters.forEach((char) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, currentX + charWidth / 2, textY);
    currentX += charWidth + letterSpacing;
    });
    
    // Layer 2: Medium glow
    currentX = startX;
    ctx.shadowBlur = 20;
    ctx.shadowColor = Colors["default-blue"].color;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    
    characters.forEach((char) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, currentX + charWidth / 2, textY);
    currentX += charWidth + letterSpacing;
    });
    
    // Layer 3: Main text (no shadow, full opacity)
    currentX = startX;
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = 'white';
    
    characters.forEach((char) => {
    const charWidth = ctx.measureText(char).width;
    ctx.fillText(char, currentX + charWidth / 2, textY);
    currentX += charWidth + letterSpacing;
    });

    // Reset shadow effects
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

} catch (error) {
    console.error("Error loading font or rendering price:", error);

    // Fallback drawing with basic letter spacing
    if (currentRenderID === renderID) {
    ctx.font = '48px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left'; // Changed to left for manual character positioning
    ctx.textBaseline = 'middle';

    const finalPrice = calculateFinalPrice(netPrice, isStarterAccount);
    const characters = finalPrice.split('');
    
    // Position fallback text with letter spacing
    let currentX = canvasWidth / 2 - ctx.measureText(finalPrice).width / 2 - (characters.length - 1) * 5; // Center starting position
    
    characters.forEach((char) => {
        ctx.fillText(char, currentX, 50);
        currentX += ctx.measureText(char).width + 10; // 10px letter spacing
    });
    }
}
}
  
export async function renderPostDescription(
ctx: CanvasRenderingContext2D,
description: string,
canvasWidth: number,
canvasHeight: number,
renderID: number,
currentRenderID: number
) {
if (currentRenderID !== renderID) return;

try {
    // Set fixed dimensions for the text area
    const textAreaWidth = 900; // Fixed width in pixels
    const textAreaHeight = 160; // Fixed height in pixels
    const maxCharCount = 160; // Estimated max character count
    
    // Truncate description if it exceeds max character count
    const truncatedDescription = description.length > maxCharCount 
    ? description.substring(0, maxCharCount - 3) + '...' 
    : description;

    // Load the font (using system Arial Bold instead of Arial Unicode Bold)
    const fontFamily = 'Arial';
    const fontSize = 30;
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Position the text - place it below the price text
    const textX = canvasWidth / 2;
    const baseY = 1150; // Base Y position for the first line (fixed)
    const lineHeight = fontSize * 1.2; // Standard line height

    // --- Apply Similar Neon Glow Effect ---
    // First measure the text to calculate word wrapping if needed
    const words = truncatedDescription.split(' ');
    const lines = [];
    let currentLine = '';
    
    // Simple word wrapping
    words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > textAreaWidth) {
        lines.push(currentLine);
        currentLine = word;
    } else {
        currentLine = testLine;
    }
    });
    if (currentLine) {
    lines.push(currentLine);
    }
    
    // Limit number of lines to fit in the fixed height
    const maxLines = Math.floor(textAreaHeight / lineHeight);
    const displayLines = lines.slice(0, maxLines);
    
    // Function to draw text with all three glow layers
    const drawTextWithGlow = (line: string, yPos: number) => {
    // Layer 1: Outer glow (larger blur)
    ctx.shadowColor = Colors["default-blue"].color;
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(line, textX, yPos);
    
    // Layer 2: Medium glow
    ctx.shadowBlur = 5;
    ctx.shadowColor = Colors["default-blue"].color;
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fillText(line, textX, yPos);
    
    // Layer 3: Main text (no shadow, full opacity)
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.fillStyle = 'white';
    ctx.fillText(line, textX, yPos);
    };
    
    // Draw each line with the first line fixed at baseY and subsequent lines flowing down
    displayLines.forEach((line, index) => {
    const lineY = baseY + (index * lineHeight);
    drawTextWithGlow(line, lineY);
    });

    // Reset shadow effects
    ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

} catch (error) {
    console.error("Error rendering post description:", error);

    // Fallback rendering
    if (currentRenderID === renderID) {
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fallbackDesc = description.length > 160 ? description.substring(0, 160) + '...' : description;
    
    ctx.fillText(fallbackDesc, canvasWidth / 2, 1150);
    }
}
}