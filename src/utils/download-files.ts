
/**
 * Attempts to save an image.
 * On the client-side, it calls an API route to perform the save on the server.
 * Includes experimental client-side saving using File System Access API as a fallback/alternative.
 */
export const saveImage = async (imageUrl: string, baseLocation: string, postCode: string): Promise<void> => {
    // Always try to save via the server API route first from the client
    if (typeof window !== 'undefined') {
        try {
            const response = await fetch('/api/save-post', { // The path to your API route
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageUrl, baseLocation, postCode }),
            });

            const result = await response.json();

            if (!response.ok) {
                // Throw an error with the message from the API route if available
                throw new Error(result.error || `Server error: ${response.statusText}`);
            }

            console.log('Server response:', result.message);
            // Optionally, notify the user of success here
            return; // Success!

        } catch (error) {
            console.error('Error calling save-image API:', error);
             throw new Error(`Failed to save image via server: ${error instanceof Error ? error.message : String(error)}`); // Re-throw error if API call fails and no fallback
        }
    } else {
        console.warn('saveImage utility called directly on server-side. This might not be intended. Use the API route or separate server logic.');
        throw new Error("Saving directly from non-API server code is not implemented in this version.");
    }
};