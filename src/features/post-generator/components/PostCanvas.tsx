import React, { useEffect, useRef, useMemo } from "react";
import { Characters } from '../data/characters';
import { GameBackground } from '../data/game-bg-fade';
import { GameFade } from '../data/game-bg-fade';
import { ThumbnailOverlay } from '../data/overlay';
import { Footer } from '../data/footer';

interface PostCanvasProps {
  postType: string;
  selectedGames: string[];
  selectedCharacters: { [key: string]: string };
  onImageGenerated: (imageUrl: string | null) => void;
}

const PostCanvas: React.FC<PostCanvasProps> = ({ 
  postType, 
  selectedGames, 
  selectedCharacters, 
  onImageGenerated 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const characterImageIndex = useMemo(() => {
    switch (selectedGames.length) {
      case 1:
        return 0;
      case 2:
        return 1;
      case 3:
        return 2;
      default:
        return 0;
    }
  }, [selectedGames.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1080;
    canvas.height = 1350;

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      });
    };

    const renderCanvas = async () => {
      try {
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Load base images
        const images: { [key: string]: HTMLImageElement } = {};

        // 1. Thumbnail Background (always fixed)
        images.background = await loadImage("/assets/post-generator/background/thumbnail_bg.webp");
        ctx.drawImage(images.background, 0, 0, 1080, 1350);

        // 2. Game Background 
        if (selectedGames && selectedGames.length > 0) {
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
            const gameBgImage = await loadImage(GameBackground[bgKey][bgSubKey].background);
            ctx.drawImage(gameBgImage, 0, 0, 1080, 1350);
          }
        }

        // 3. Characters
        for (const game of selectedGames) {
          if (selectedCharacters[game]) {
            const characterData = Characters[game][selectedCharacters[game]];
            const characterImage = await loadImage(
              characterData.images[characterImageIndex]
            );

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
              ctx.drawImage(characterImage, 0, 0, 1080, 1350);
            }
          }
        }

        // 4. Game Fade
        if (selectedGames && selectedGames.length > 0) {
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

          // Add additional null checks here
          if (GameFade[fadeKey] && GameFade[fadeKey][fadeSubKey]) {
            const gameFadeImage = await loadImage(GameFade[fadeKey][fadeSubKey].background);
            ctx.drawImage(gameFadeImage, 0, 0, 1080, 1350);
          }
        }

        // 5. Overlay (depends on post type and games)
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

        // Add null checks for overlay
        if (ThumbnailOverlay[overlayKey] && ThumbnailOverlay[overlayKey][postType.toLowerCase()]) {
        // Modify the overlay path to use the dynamic index
        const originalOverlay = ThumbnailOverlay[overlayKey][postType.toLowerCase()].overlay;
        const modifiedOverlay = originalOverlay.replace(
        /overlay_([^_]+)_[^.]+\.webp/, 
        `overlay_$1_${overlayImageIndex + 1}.webp`
        );

        const overlayImage = await loadImage(modifiedOverlay);
        ctx.drawImage(overlayImage, 0, 0, 1080, 1350);
        }

        // 6. Footer (depends on post type)
        // Add null check for footer
        if (Footer[postType.toLowerCase()]) {
          const footerImage = await loadImage(Footer[postType.toLowerCase()].footer);
          ctx.drawImage(footerImage, 0, 0, 1080, 1350);
        }

        // Convert canvas to image URL and pass it to the parent component
        const finalImageUrl = canvas.toDataURL("image/png");
        onImageGenerated(finalImageUrl);

      } catch (error) {
        console.error("Error rendering canvas:", error);
        onImageGenerated(null);
      }
    };

    // Remove the length check condition
    renderCanvas();
  }, [postType, selectedGames, selectedCharacters, characterImageIndex, onImageGenerated]);

  return <canvas ref={canvasRef} className="w-[540px] h-[675px]" />;
};

export default PostCanvas;