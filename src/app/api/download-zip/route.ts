// app/api/download-zip/route.ts
import { NextResponse } from 'next/server';
import JSZip from 'jszip';

export async function POST(request: Request) {
    try {
        const { images, postCode, isMobile } = await request.json();

        if (!images || !postCode || !Array.isArray(images) || images.length === 0) {
            return NextResponse.json({ error: 'Missing required parameters or invalid image data' }, { status: 400 });
        }

        // For mobile, return the processed images directly
        if (isMobile === true) {
            const processedImages = [];
            
            for (let i = 0; i < images.length; i++) {
                const { imageUrl, fileName } = images[i];
                
                if (!imageUrl) continue;
                
                processedImages.push({
                    imageUrl,
                    fileName: `${fileName}`
                });
            }
            
            return NextResponse.json({
                success: true,
                images: processedImages
            });
        }
        
        // For desktop, create ZIP as before
        const zip = new JSZip();
        
        // Process each image
        for (let i = 0; i < images.length; i++) {
            const { imageUrl, fileName } = images[i];
            
            if (!imageUrl) continue;
            
            const processedImageData = imageUrl;
            let fileExtension = '.png'; // Default

            // Determine file extension from image data
            if (processedImageData.startsWith('data:')) {
                const matches = processedImageData.match(/^data:image\/([a-zA-Z]+);base64,/);
                if (matches && matches.length >= 2) {
                    const imageType = matches[1].toLowerCase();
                    if (imageType === 'jpeg' || imageType === 'jpg') {
                        fileExtension = '.jpg';
                    } else if (imageType === 'png') {
                        fileExtension = '.png';
                    }
                }
            } else {
                // For URL images, try to determine extension from content-type or URL
                try {
                    const imageResponse = await fetch(imageUrl, { method: 'HEAD' });
                    if (imageResponse.ok) {
                        const contentType = imageResponse.headers.get('content-type');
                        if (contentType) {
                            if (contentType.includes('jpeg') || contentType.includes('jpg')) {
                                fileExtension = '.jpg';
                            } else if (contentType.includes('png')) {
                                fileExtension = '.png';
                            }
                        }
                    }
                } catch (err) {
                    console.error('Error getting content type:', err);
                    // Continue with default extension
                }
            }
            
            // Get image data as buffer
            let imageBuffer: Buffer;
            
            try {
                if (processedImageData.startsWith('data:')) {
                    // Handle base64 image
                    const base64Data = processedImageData.split(',')[1];
                    imageBuffer = Buffer.from(base64Data, 'base64');
                } else {
                    // Handle URL image
                    const imageResponse = await fetch(processedImageData);
                    if (!imageResponse.ok) {
                        throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
                    }
                    imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
                }

                // Add to zip with proper name
                const imageName = `${fileName}${fileExtension}`;
                zip.file(imageName, imageBuffer);
            } catch (err) {
                console.error(`Error processing image ${i}:`, err);
                // Continue with other images
            }
        }
        
        // Generate the zip file
        const zipBuffer = await zip.generateAsync({
            type: 'nodebuffer',
            compression: 'DEFLATE',
            compressionOptions: {
                level: 6
            }
        });

        // Return binary data for desktop
        const response = new NextResponse(zipBuffer);
        response.headers.set('Content-Type', 'application/zip');
        response.headers.set('Content-Disposition', `attachment; filename="${postCode}.zip"`);
        response.headers.set('Cache-Control', 'no-store');
        return response;

    } catch (error) {
        console.error('Error creating ZIP file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to create ZIP file: ${errorMessage}` }, { status: 500 });
    }
}