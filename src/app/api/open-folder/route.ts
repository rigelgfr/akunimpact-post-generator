// app/api/open-folder/route.ts
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
    try {
        const { path: folderPath } = await request.json();
        
        if (!folderPath) {
            return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 });
        }

        // Get absolute path
        const absolutePath = path.join(process.cwd(), 'generated_images', folderPath);
        
        // Open the folder based on the OS
        const platform = os.platform();
        let command;
        
        if (platform === 'win32') {
            command = `explorer "${absolutePath}"`;
        } else if (platform === 'darwin') {
            command = `open "${absolutePath}"`;
        } else if (platform === 'linux') {
            command = `xdg-open "${absolutePath}"`;
        } else {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        exec(command);

        return NextResponse.json({ 
            message: `Folder opened successfully`,
            path: absolutePath
        }, { status: 200 });

    } catch (error) {
        console.error('Error opening folder:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: `Failed to open folder: ${errorMessage}` }, { status: 500 });
    }
}