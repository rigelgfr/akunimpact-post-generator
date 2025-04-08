import { InferenceSession, Tensor, env } from 'onnxruntime-web';

// --- Configuration (Client-Side) ---
const MODEL_URL_PATH = '/models/uid_detection.onnx'; // Relative to public
const WASM_DIR_PATH = '/onnxruntime/';      // Relative to public

const MODEL_INPUT_SHAPE = [1, 3, 1280, 1280]; // B C H W
const CONFIDENCE_THRESHOLD = 0.15;
const IOU_THRESHOLD = 0.45;
const NUM_CLASSES = 4;
const CLASS_NAMES = ['genshin-uid', 'hsr-uid', 'web-uid', 'zzz-uid'];

interface PadInfo {
    width: number; // Total padding added horizontally (padLeft + padRight)
    height: number; // Total padding added vertically (padTop + padBottom)
    ratio: number; // The scaling ratio applied to the original image
}

// --- Client-Side ONNX Runtime Session Cache ---
let clientSession: InferenceSession | null = null;
let clientLoadingPromise: Promise<InferenceSession> | null = null;

export interface DetectionBox {
    x1: number; // Top-left x
    y1: number; // Top-left y
    x2: number; // Bottom-right x
    y2: number; // Bottom-right y
    score: number; // Confidence score
    classId: number; // Class index
    className: string; // Class name
}

export async function getClientSession(): Promise<InferenceSession> {
    // Ensure running in browser
    if (typeof window === 'undefined') {
        throw new Error('getClientSession can only be called in the browser.');
    }

    if (clientSession) return clientSession;
    if (clientLoadingPromise) return clientLoadingPromise;

    clientLoadingPromise = new Promise(async (resolve, reject) => {
        try {
            console.log('Initializing ONNX Runtime client session...');
            env.wasm.wasmPaths = WASM_DIR_PATH;

            const modelUrl = new URL(MODEL_URL_PATH, window.location.origin).toString();
            const modelResponse = await fetch(modelUrl);
            if (!modelResponse.ok) throw new Error(`Failed to fetch model: ${modelResponse.statusText}`);
            const modelArrayBuffer = await modelResponse.arrayBuffer();

            const options: InferenceSession.SessionOptions = {
                executionProviders: ['webgl', 'wasm'],
                graphOptimizationLevel: 'all',
            };

            clientSession = await InferenceSession.create(modelArrayBuffer, options);
            console.log('ONNX Runtime client session initialized successfully.');
            resolve(clientSession);
        } catch (error) {
            console.error('Error initializing ONNX Runtime client session:', error);
            reject(error);
        } finally {
            clientLoadingPromise = null;
        }
    });
    return clientLoadingPromise;
}

export async function preprocessImageForClient(
    imageSource: HTMLImageElement | File | string
): Promise<{ tensor: Tensor, originalWidth: number, originalHeight: number, padInfo: { width: number, height: number, ratio: number } }> {
    let imageElement: HTMLImageElement;

    // 1. Load image data into an HTMLImageElement (same as before)
    if (imageSource instanceof HTMLImageElement) {
        imageElement = imageSource;
        if (!imageElement.complete || imageElement.naturalWidth === 0) { // Check naturalWidth too
             await new Promise((resolve, reject) => {
                 imageElement.onload = resolve;
                 imageElement.onerror = reject;
                 // Add safety timeout?
             });
        }
    } else if (imageSource instanceof File) {
        imageElement = await new Promise((resolve, reject) => {
             const img = new Image();
             const reader = new FileReader();
             reader.onload = (e) => {
                 img.onload = () => resolve(img);
                 img.onerror = (err) => reject(`Image load error: ${err}`);
                 img.src = e.target?.result as string;
             };
             reader.onerror = (err) => reject(`FileReader error: ${err}`);
             reader.readAsDataURL(imageSource);
         });
    } else if (typeof imageSource === 'string') {
         imageElement = await new Promise((resolve, reject) => {
             const img = new Image();
             img.onload = () => resolve(img);
             img.onerror = (err) => reject(`Image load error: ${err}`);
             img.crossOrigin = "anonymous";
             img.src = imageSource;
         });
    } else {
        throw new Error("Invalid image source type");
    }
    // --- End of Image Loading ---

    const originalWidth = imageElement.naturalWidth;
    const originalHeight = imageElement.naturalHeight;
    const targetWidth = MODEL_INPUT_SHAPE[3]; // e.g., 1280
    const targetHeight = MODEL_INPUT_SHAPE[2]; // e.g., 1280

    // 2. Calculate Letterbox Dimensions
    const ratio = Math.min(targetWidth / originalWidth, targetHeight / originalHeight);
    const newWidth = Math.round(originalWidth * ratio);
    const newHeight = Math.round(originalHeight * ratio);

    const padWidth = (targetWidth - newWidth) / 2;
    const padHeight = (targetHeight - newHeight) / 2;

    const dx = Math.round(padWidth); // Offset x to draw the image
    const dy = Math.round(padHeight); // Offset y to draw the image

    // Store padding info for potential postprocessing adjustments
    const padInfo = { width: padWidth * 2, height: padHeight * 2, ratio: ratio };

    // 3. Use Canvas to Resize with Letterboxing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error('Could not get 2D context from canvas');

    // --- Letterbox ---
    // Fill background with padding color (common YOLO default is 114, 114, 114)
    ctx.fillStyle = 'rgb(114, 114, 114)';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Draw the scaled image onto the canvas at the calculated offset
    // void ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); -> Use this for clarity
    // Draw imageElement (source) onto canvas (destination)
    ctx.drawImage(
        imageElement, // Source image
        0, 0, originalWidth, originalHeight, // Source rect (full image)
        dx, dy, newWidth, newHeight // Destination rect (scaled and positioned)
    );
    // --- End Letterbox ---

    const imageData = ctx.getImageData(0, 0, targetWidth, targetHeight); // Get pixel data RGBA

    // 4. Convert RGBA to Float32Array in NCHW format (normalized) - same as before
    const tensorData = new Float32Array(1 * 3 * targetHeight * targetWidth); // Use target dimensions
    const pixels = imageData.data;

    for (let i = 0; i < pixels.length / 4; i++) {
        const R = pixels[i * 4 + 0] / 255.0;
        const G = pixels[i * 4 + 1] / 255.0;
        const B = pixels[i * 4 + 2] / 255.0;

        const x = i % targetWidth;
        const y = Math.floor(i / targetWidth);

        tensorData[0 * targetHeight * targetWidth + y * targetWidth + x] = R; // R channel
        tensorData[1 * targetHeight * targetWidth + y * targetWidth + x] = G; // G channel
        tensorData[2 * targetHeight * targetWidth + y * targetWidth + x] = B; // B channel
    }

    const tensor = new Tensor('float32', tensorData, MODEL_INPUT_SHAPE);
    // Return padding info along with tensor and original dimensions
    return { tensor, originalWidth, originalHeight, padInfo };
}

export function processOutput(
    outputTensor: Tensor,
    originalWidth: number,
    originalHeight: number,
    padInfo: PadInfo // <-- Add padInfo parameter
): DetectionBox[] {
    const outputData = outputTensor.data as Float32Array;
    const outputShape = outputTensor.dims; // Should be [1, 8, 33600] (or similar)
    const numOutputs = outputShape[1]; // 4 (box) + NUM_CLASSES
    const numPredictions = outputShape[2];
    // Input dimensions are implicitly known via padInfo and MODEL_INPUT_SHAPE
    // const inputWidth = MODEL_INPUT_SHAPE[3]; // Not directly needed for scaling anymore
    // const inputHeight = MODEL_INPUT_SHAPE[2]; // Not directly needed for scaling anymore

    if (numOutputs !== 4 + NUM_CLASSES) {
        console.warn(`Output shape mismatch: Expected ${4 + NUM_CLASSES} outputs, but got ${numOutputs}. Adjust NUM_CLASSES.`);
    }

    // 1. Extract boxes relative to padded input size
    const boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> = [];
    for (let i = 0; i < numPredictions; ++i) {
        const baseIndex = i;
        const cx_pad = outputData[baseIndex + 0 * numPredictions]; // Center X relative to padded input
        const cy_pad = outputData[baseIndex + 1 * numPredictions]; // Center Y relative to padded input
        const w_pad = outputData[baseIndex + 2 * numPredictions];  // Width relative to padded input
        const h_pad = outputData[baseIndex + 3 * numPredictions];  // Height relative to padded input

        let maxScore = 0;
        let classId = -1;
        for (let j = 0; j < NUM_CLASSES; ++j) {
            // Ensure slicing is correct if numOutputs warning occurred
            const scoreIndex = 4 + j;
            if (scoreIndex >= numOutputs) continue; // Avoid out-of-bounds
            const score = outputData[baseIndex + scoreIndex * numPredictions];
            if (score > maxScore) {
                maxScore = score;
                classId = j;
            }
        }

        if (maxScore > CONFIDENCE_THRESHOLD) {
            // Coordinates relative to padded input (e.g., 1280x1280)
            const x1_pad = cx_pad - w_pad / 2.0;
            const y1_pad = cy_pad - h_pad / 2.0;
            const x2_pad = cx_pad + w_pad / 2.0;
            const y2_pad = cy_pad + h_pad / 2.0;
            boxes.push({ x1: x1_pad, y1: y1_pad, x2: x2_pad, y2: y2_pad, score: maxScore, classId });
        }
    }

    // 2. Apply NMS on padded input coordinates (no change here)
    const nmsResults = applyNMS(boxes, IOU_THRESHOLD);

    // 3. Scale coordinates back to ORIGINAL image dimensions, accounting for padding
    const finalDetections: DetectionBox[] = nmsResults.map(box => {
        // Calculate padding offsets (top/left padding)
        // Assuming symmetrical padding; padInfo contains TOTAL padding
        const padX = padInfo.width / 2;
        const padY = padInfo.height / 2;
        const ratio = padInfo.ratio;

        // Translate coordinates back to the scaled image space (remove padding)
        const x1_scaled = box.x1 - padX;
        const y1_scaled = box.y1 - padY;
        const x2_scaled = box.x2 - padX;
        const y2_scaled = box.y2 - padY;

        // Scale coordinates back to the original image dimensions
        const x1_original = x1_scaled / ratio;
        const y1_original = y1_scaled / ratio;
        const x2_original = x2_scaled / ratio;
        const y2_original = y2_scaled / ratio;

        // Clamp coordinates to the bounds of the ORIGINAL image
        const clampedX1 = Math.max(0, x1_original);
        const clampedY1 = Math.max(0, y1_original);
        const clampedX2 = Math.min(originalWidth, x2_original);   // Use originalWidth
        const clampedY2 = Math.min(originalHeight, y2_original);  // Use originalHeight

        // Round final coordinates
        const finalX1 = Math.round(clampedX1);
        const finalY1 = Math.round(clampedY1);
        const finalX2 = Math.round(clampedX2);
        const finalY2 = Math.round(clampedY2);

        // Ensure width/height are at least 1 pixel after clamping/rounding if needed
        // (Optional, depends if zero-width boxes cause issues downstream)
        // if (finalX2 <= finalX1) finalX2 = finalX1 + 1;
        // if (finalY2 <= finalY1) finalY2 = finalY1 + 1;

        return {
            x1: finalX1,
            y1: finalY1,
            x2: finalX2,
            y2: finalY2,
            score: box.score,
            classId: box.classId,
            className: CLASS_NAMES[box.classId] || `class_${box.classId}`, // Fallback name
        };
    });

    return finalDetections;
}

export function applyNMS(boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }>, iouThreshold: number): Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> {
     // ... (Your existing pure JS implementation) ...
    boxes.sort((a, b) => b.score - a.score);
    const selectedBoxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> = [];
    while (boxes.length > 0) {
        const currentBox = boxes.shift()!;
        selectedBoxes.push(currentBox);
        boxes = boxes.filter(box => {
            if (box.classId !== currentBox.classId) return true;
            const iou = calculateIoU(currentBox, box);
            return iou <= iouThreshold;
        });
    }
    return selectedBoxes;
}

export function calculateIoU(box1: { x1: number; y1: number; x2: number; y2: number }, box2: { x1: number; y1: number; x2: number; y2: number }): number {
     // ... (Your existing pure JS implementation) ...
    const xA = Math.max(box1.x1, box2.x1);
    const yA = Math.max(box1.y1, box2.y1);
    const xB = Math.min(box1.x2, box2.x2);
    const yB = Math.min(box1.y2, box2.y2);
    const intersectionArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    const box1Area = (box1.x2 - box1.x1) * (box1.y2 - box1.y1);
    const box2Area = (box2.x2 - box2.x1) * (box2.y2 - box2.y1);
    const unionArea = box1Area + box2Area - intersectionArea;
    return unionArea > 0 ? intersectionArea / unionArea : 0;
}
