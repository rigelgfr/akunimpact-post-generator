import { getSession, preprocessImage, processOutput } from '@/utils/model-utils';
import { NextRequest, NextResponse } from 'next/server';
import { Tensor } from 'onnxruntime-node'; // Import specific named exports

// --- API Route Handler ---
export async function POST(request: NextRequest) {
    try {
        console.log("API route /api/detect hit (POST)");

        // 1. Get Image Data from Request
        const formData = await request.formData();
        const imageFile = formData.get('image') as File | null;

        if (!imageFile) {
            return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
        }

        const imageBuffer = Buffer.from(await imageFile.arrayBuffer());

        // 2. Load ONNX Session (cached)
        const currentSession = await getSession();
        const inputName = currentSession.inputNames[0]; // Assume first input
        const outputName = currentSession.outputNames[0]; // Assume first output
        console.log(`Using Input: ${inputName}, Output: ${outputName}`);

        // 3. Preprocess Image
        console.time('Preprocessing');
        const { tensor: inputTensor, originalWidth, originalHeight } = await preprocessImage(imageBuffer);
        console.timeEnd('Preprocessing');

        // 4. Run Inference
        console.time('Inference');
        const feeds: Record<string, Tensor> = {};
        feeds[inputName] = inputTensor;

        const results = await currentSession.run(feeds);
        console.timeEnd('Inference');

        const outputTensor = results[outputName];
        if (!outputTensor) {
            throw new Error(`Output tensor '${outputName}' not found in results.`);
        }
         console.log('Output Tensor Dims:', outputTensor.dims);
         console.log('Output Tensor Type:', outputTensor.type);
         // console.log('Output Tensor Data (first 50):', (outputTensor.data as Float32Array).slice(0, 50)); // Log some data for debugging

        // 5. Postprocess Output
        console.time('Postprocessing');
        const detections = processOutput(outputTensor, originalWidth, originalHeight);
        console.timeEnd('Postprocessing');
        console.log(`Detected ${detections.length} objects.`);


        // 6. Return Results
        return NextResponse.json({ detections });

    } catch (error: unknown) {
        console.error('Error in detection API:', error);

        if (error instanceof Error && error.message.includes('Model failed to load')) {
            return NextResponse.json({ error: 'Failed to load the ONNX model.', details: error.message }, { status: 500 });
        }
        if (error instanceof Error && error.message.includes('input name')) {
                return NextResponse.json({ error: 'Input name mismatch or issue.', details: error.message }, { status: 500 });
        }
       const errorMessage = error instanceof Error ? error.message : String(error);
       return NextResponse.json({ error: 'An error occurred during detection.', details: errorMessage }, { status: 500 });
    }
}