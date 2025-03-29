// Get character image index based on game count
export const getCharacterImageIndex = (gameCount: number) => {
    switch (gameCount) {
      case 1: return 0;
      case 2: return 1;
      case 3: return 2;
      default: return 0;
    }
  };