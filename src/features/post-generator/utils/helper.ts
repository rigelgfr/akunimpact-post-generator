// src/data/helpers.ts
import { Characters } from '../data/characters';
import { GameBackground } from '../data/game-bg-fade';
import { GameFade } from '../data/game-bg-fade';
import { ThumbnailOverlay } from '../data/overlay';
import { Footer } from '../data/footer';

// Determine if single, double, or all games are selected
export const getGameMode = (games: string[]): 'single' | 'double' | 'all' => {
  const count = games.length;
  if (count === 1) return 'single';
  if (count === 2) return 'double';
  if (count >= 3) return 'all'; // Assuming 3 is 'all'
  return 'single'; // Default or handle empty case
};

// Generate the key used in GameBackground, GameFade, etc.
// Ensures consistent order for double games (e.g., 'gi_hsr')
export const getGameKey = (games: string[], mode: 'single' | 'double' | 'all'): string => {
  if (mode === 'single') return games[0] || ''; // Return the single game name
  if (mode === 'double') return [...games].sort().join('_'); // Sort for consistency
  if (mode === 'all') return 'all';
  return ''; // Default or handle empty case
};

// --- Functions to get specific asset paths ---

export const getGameBackgroundPath = (games: string[] | undefined): string | undefined => {
    // First, check if games is undefined
    if (!games || games.length === 0) return undefined; // No background if no games or undefined

    const mode = getGameMode(games);
    const key = getGameKey(games, mode);

    // Add additional null checks for GameBackground
    const modebackgrounds = GameBackground[mode];
    if (!modebackgrounds) return undefined;

    const keyBackground = modebackgrounds[key];
    if (!keyBackground) return undefined;

    // Add '/assets/post-generator/' prefix if missing in data
    const path = keyBackground.background;
    return path ? `/assets/post-generator/${path.replace('assets/post-generator/', '')}` : undefined;
};

export const getGameFadePath = (games: string[]): string | undefined => {
    if (games.length === 0) return undefined; // No fade if no games
    const mode = getGameMode(games);
    const key = getGameKey(games, mode);
    const path = GameFade[mode]?.[key]?.background;
    return path ? `/assets/post-generator/${path.replace('assets/post-generator/','')}` : undefined;
};

export const getCharacterImagePaths = (
    selectedCharacters: { [key: string]: string }
): string[] => {
    return Object.entries(selectedCharacters)
        .map(([game, characterName]) => {
            if (!characterName) return null; // Skip if no character selected for this game
            const characterData = Characters[game]?.[characterName];
            // Default to first image if available
            const imagePath = characterData?.images?.[0];
            // Ensure path starts correctly (handle potential variations in data)
            return imagePath ? imagePath.startsWith('/') ? imagePath : `/${imagePath}` : null;
        })
        .filter((path): path is string => path !== null); // Filter out nulls and type guard
};


export const getOverlayThumbnailPath = (games: string[], postType: string): string | undefined => {
    if (games.length === 0 || !postType) return undefined;
    const mode = getGameMode(games);
    const typeKey = postType.toLowerCase();
    const path = ThumbnailOverlay[mode]?.[typeKey]?.overlay;
    // Add '/assets/post-generator/' prefix if missing in data
    return path ? `/assets/post-generator/${path.replace('assets/post-generator/','')}` : undefined;
};

export const getFooterPath = (postType: string): string | undefined => {
    if (!postType) return undefined;
    const typeKey = postType.toLowerCase();
    const path = Footer[typeKey]?.footer;
     // Ensure path starts correctly
    return path ? path.startsWith('/') ? path : `/${path}` : undefined;
};

// Define character positions (example - adjust as needed)
export const getCharacterPositions = (games: string[]): { x: number; y: number }[] => {
    const mode = getGameMode(games);
    if (mode === 'single') {
        return [{ x: 0, y: 0 }]; // Centered or specific position
    }
    if (mode === 'double') {
        // Example: position for left and right
        return [{ x: -150, y: 0 }, { x: 150, y: 0 }]; // Adjust these offsets
    }
    if (mode === 'all') {
        // Example: position for left, center, right
        return [{ x: -250, y: 0 }, { x: 0, y: 0 }, { x: 250, y: 0 }]; // Adjust these offsets
    }
    return [];
};