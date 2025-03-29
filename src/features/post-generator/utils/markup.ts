export const calculateFinalPrice = (netPrice: string, isStarterAccount: boolean): string => {
    // Extract numeric part and convert to number
    const numericValue = parseInt(netPrice.replace(/\D/g, ''), 10);
    if (isNaN(numericValue) || numericValue < 0) return "0";

    let finalPrice: number;

    if (isStarterAccount) {
        // Special case: Starter Account only adds 5K
        finalPrice = numericValue + 5000;
    } else {
        // Apply markup formula
        if (numericValue < 100000) {
            finalPrice = numericValue * 1.1;
        } else if (numericValue <= 299000) {
            finalPrice = numericValue + 20000;
        } else if (numericValue <= 699000) {
            finalPrice = numericValue + 30000;
        } else {
            finalPrice = numericValue * 1.08;
        }
    }

    // Round the final price using standard rounding conventions
    finalPrice = Math.round(finalPrice);

    // Return as formatted string for canvas
    return `${finalPrice.toLocaleString()}K`;
};
