// app/api/download-post-zip/route.ts
import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { detectAndMaskObjects } from '@/utils/model-utils';

export async function POST(request: Request) {
    try {
        const { images, postCode } = await request.json();

        if (!images || !postCode || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'Missing required parameters or invalid image data' }, { status: 400 });
        }

        // Create a new JSZip instance
        const zip = new JSZip();
        
        // Process each image
        for (let i = 0; i < images.length; i++) {
            const { imageUrl, fileName, applyMasking = false } = images[i];
            
            if (!imageUrl) continue;
            
            // Handle image data - could be base64 or URL
            let imageBuffer: Buffer;
            let fileExtension = '.png'; // Default

            if (imageUrl.startsWith('data:')) {
                // Handle base64 image
                const matches = imageUrl.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
                
                if (!matches || matches.length !== 3) {
                    throw new Error('Invalid base64 image format');
                }
                
                const imageType = matches[1].toLowerCase();
                const base64Data = matches[2];
                
                // Set file extension based on image type
                if (imageType === 'jpeg' || imageType === 'jpg') {
                    fileExtension = '.jpg';
                } else if (imageType === 'png') {
                    fileExtension = '.png';
                }
                
                imageBuffer = Buffer.from(base64Data, 'base64');
            } else {
                // Handle URL image
                const imageResponse = await fetch(imageUrl);
                if (!imageResponse.ok) {
                    throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                }
                
                // Get content type for file extension
                const contentType = imageResponse.headers.get('content-type');
                
                if (contentType) {
                    if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                        fileExtension = '.jpg';
                    } else if (contentType.includes('png')) {
                        fileExtension = '.png';
                    }
                }
                
                imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            }

            // Apply object detection and masking if requested (and not for thumbnails)
            if (applyMasking) {
                try {
                    imageBuffer = await detectAndMaskObjects(imageBuffer, '#4086a2');
                } catch (maskingError) {
                    console.error('Error during object detection and masking:', maskingError);
                    // Continue with the original image if masking fails
                }
            }

            // Add to zip with proper name
            const imageName = `${fileName}${fileExtension}`;
            zip.file(imageName, imageBuffer);
        }
        
        // Generate the zip file
        const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        // Create response with appropriate headers
        const response = new NextResponse(zipBuffer);
        response.headers.set('Content-Type', 'application/zip');
        response.headers.set('Content-Disposition', `attachment; filename="${postCode}.zip"`);
        
        return response;

    } catch (error) {
        console.error('Error creating ZIP file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to create ZIP file: ${errorMessage}` }, { status: 500 });
    }
}