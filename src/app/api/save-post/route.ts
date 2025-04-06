// app/api/save-post/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { detectAndMaskObjects } from '@/utils/model-utils';

export async function POST(request: Request) {
    try {
        const { imageUrl, postCode, fileName, applyMasking = false } = await request.json();

        if (!imageUrl || !postCode) {
            return NextResponse.json({ error: 'Missing required parameters: imageUrl, postCode' }, { status: 400 });
        }

        // Get today's date in the format DD-MM-YYYY
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const year = today.getFullYear();
        const dateStr = `${day}-${month}-${year}`;

        // Set fixed base path in the app directory
        const basePath = path.join(process.cwd(), 'generated_images', 'posts');
        const dateDir = path.join(basePath, dateStr);
        const postDir = path.join(dateDir, postCode);

        // Create directories if they don't exist
        await fs.promises.mkdir(postDir, { recursive: true });

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
        if (applyMasking && fileName && !fileName.includes('thumbnail')) {
            try {
                imageBuffer = await detectAndMaskObjects(imageBuffer, '#4086a2');
            } catch (maskingError) {
                console.error('Error during object detection and masking:', maskingError);
                // Continue with the original image if masking fails
            }
        }

        // Use the provided fileName or generate a new one
        let imageName;
        if (fileName) {
            imageName = `${fileName}${fileExtension}`;
        } else {
            // Find the next file number (legacy behavior as fallback)
            let fileNumber = 1;
            try {
                const existingFiles = await fs.promises.readdir(postDir);
                const numberedFiles = existingFiles.filter(file => 
                    file.match(new RegExp(`^\\d+${fileExtension.replace('.', '\\.')}$`))
                );
                
                if (numberedFiles.length > 0) {
                    const highestNumber = Math.max(...numberedFiles.map(file => {
                        const match = file.match(/^(\d+)/);
                        return match ? parseInt(match[1], 10) : 0;
                    }));
                    fileNumber = highestNumber + 1;
                }
            } catch (error) {
                console.error(`Failed to find file number: ${error}`);
            }
            
            imageName = `${fileNumber}${fileExtension}`;
        }

        // Create path
        const filePath = path.join(postDir, imageName);
        const relativePath = path.join(dateStr, postCode, imageName);

        // Save the file
        await fs.promises.writeFile(filePath, imageBuffer);

        return NextResponse.json({ 
            message: `Image saved successfully`,
            path: relativePath,
            fullPath: filePath
        }, { status: 200 });

    } catch (error) {
        console.error('Error saving file:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to save file: ${errorMessage}` }, { status: 500 });
    }
}