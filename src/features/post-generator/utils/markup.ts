export const calculateFinalPrice = (netPrice: string, isStarterAccount: boolean): string => {
    // Extract numeric part and convert to number
    const numericValue = parseInt(netPrice.replace(/\D/g, ''), 10);
    if (isNaN(numericValue) || numericValue < 0) return "0K"; // Return "0K" for invalid input

    let finalPrice: number;
    const numericValueInThousands = numericValue * 1000;

    if (isStarterAccount) {
        // Special case: Starter Account only adds 5K (5000)
        finalPrice = numericValueInThousands + 5000;
    } else {
        // Apply markup formula
        if (numericValueInThousands < 100000) {
            finalPrice = numericValueInThousands + 5000;
        } else if (numericValueInThousands <= 299000) {
            finalPrice = numericValueInThousands + 20000;
        } else if (numericValueInThousands <= 699000) {
            finalPrice = numericValueInThousands + 30000;
        } else if (numericValueInThousands <= 999000) {
            finalPrice = numericValueInThousands + 50000;
        } else {
            finalPrice = numericValueInThousands * 1.08;
        }
    }

    // Round the final price using standard rounding conventions
    finalPrice = Math.round(finalPrice);

    // Convert back to thousands and format
    const finalPriceInThousands = finalPrice / 1000;

    return `${Math.round(finalPriceInThousands)}K`;
};