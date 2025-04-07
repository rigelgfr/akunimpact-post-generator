// app/api/mask-image/route.ts
import { NextResponse } from 'next/server';
import { detectAndMaskObjects } from '@/utils/model-utils';

export async function POST(request: Request) {
    try {
        const { imageData, maskColor = '#4086a2' } = await request.json();
        
        if (!imageData) {
            return NextResponse.json({ error: 'Missing image data' }, { status: 400 });
        }
        
        // Convert base64 to buffer
        let imageBuffer: Buffer;
        if (imageData.startsWith('data:')) {
            // Handle base64 image
            const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
            
            if (!matches || matches.length !== 3) {
                throw new Error('Invalid base64 image format');
            }
            
            const base64Data = matches[2];
            imageBuffer = Buffer.from(base64Data, 'base64');
        } else {
            // Handle URL image
            const imageResponse = await fetch(imageData);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
            }
            
            imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        }

        // Apply masking
        const maskedImageBuffer = await detectAndMaskObjects(imageBuffer, maskColor);
        
        // Convert back to base64
        const maskedBase64 = `data:image/png;base64,${maskedImageBuffer.toString('base64')}`;
        
        return NextResponse.json({ 
            maskedImage: maskedBase64 
        });

    } catch (error) {
        console.error('Error during image masking:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to mask image: ${errorMessage}` }, { status: 500 });
    }
}