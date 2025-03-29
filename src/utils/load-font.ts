// fontUtils.ts
/**
 * Utility for loading custom fonts
 */

// Cache to track which fonts have already been loaded
const loadedFonts: Record<string, boolean> = {};

/**
 * Loads a font if it hasn't been loaded already
 * @param fontFamily - The name of the font family
 * @param fontUrl - The URL to the font file
 * @returns A promise that resolves when the font is loaded
 */
export const loadFont = async (fontFamily: string, fontUrl: string): Promise<void> => {
  // Return early if this font has already been loaded
  if (loadedFonts[fontFamily]) {
    return;
  }
  
  try {
    const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
    const loadedFont = await fontFace.load();
    document.fonts.add(loadedFont);
    
    // Mark this font as loaded
    loadedFonts[fontFamily] = true;
  } catch (error) {
    console.error(`Error loading font ${fontFamily}:`, error);
    throw error;
  }
};

/**
 * Checks if a font is already loaded
 * @param fontFamily - The name of the font family to check
 * @returns Boolean indicating if the font is loaded
 */
export const isFontLoaded = (fontFamily: string): boolean => {
  return !!loadedFonts[fontFamily];
};