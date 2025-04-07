import { InferenceSession, Tensor, env } from 'onnxruntime-web';

// --- Configuration (Client-Side) ---
const MODEL_URL_PATH = '/models/best.onnx'; // Relative to public
const WASM_DIR_PATH = '/onnxruntime/';      // Relative to public

const MODEL_INPUT_SHAPE = [1, 3, 1280, 1280]; // B C H W
const CONFIDENCE_THRESHOLD = 0.2;
const IOU_THRESHOLD = 0.45;
const NUM_CLASSES = 4;
const CLASS_NAMES = ['genshin-uid', 'hsr-uid', 'web-uid', 'zzz-uid'];

// --- Client-Side ONNX Runtime Session Cache ---
let clientSession: InferenceSession | null = null;
let clientLoadingPromise: Promise<InferenceSession> | null = null;

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

// --- Preprocessing (Client-Side using Canvas) ---
export async function preprocessImageForClient(
    imageSource: HTMLImageElement | File | string
): Promise<{ tensor: Tensor, originalWidth: number, originalHeight: number }> {
    let imageElement: HTMLImageElement;

    // 1. Load image data into an HTMLImageElement
    if (imageSource instanceof HTMLImageElement) {
        imageElement = imageSource;
        if (!imageElement.complete) {
             await new Promise((resolve, reject) => {
                 imageElement.onload = resolve;
                 imageElement.onerror = reject;
             });
        }
    } else if (imageSource instanceof File) {
        imageElement = await new Promise((resolve, reject) => {
             const img = new Image();
             const reader = new FileReader();
             reader.onload = (e) => {
                 img.onload = () => resolve(img);
                 img.onerror = reject;
                 img.src = e.target?.result as string;
             };
             reader.onerror = reject;
             reader.readAsDataURL(imageSource);
         });
    } else if (typeof imageSource === 'string') {
         imageElement = await new Promise((resolve, reject) => {
             const img = new Image();
             img.onload = () => resolve(img);
             img.onerror = reject;
             // Handle potential CORS issues if URL is external and not configured properly
             img.crossOrigin = "anonymous";
             img.src = imageSource;
         });
    } else {
        throw new Error("Invalid image source type");
    }


    const originalWidth = imageElement.naturalWidth;
    const originalHeight = imageElement.naturalHeight;
    const inputWidth = MODEL_INPUT_SHAPE[3];
    const inputHeight = MODEL_INPUT_SHAPE[2];

    // 2. Use Canvas to resize and get pixel data
    const canvas = document.createElement('canvas');
    canvas.width = inputWidth;
    canvas.height = inputHeight;
    const ctx = canvas.getContext('2d', { willReadFrequently: true }); // Check if willReadFrequently helps perf
    if (!ctx) throw new Error('Could not get 2D context from canvas');

    ctx.drawImage(imageElement, 0, 0, inputWidth, inputHeight); // Resize by drawing
    const imageData = ctx.getImageData(0, 0, inputWidth, inputHeight); // Get pixel data RGBA

    // 3. Convert RGBA to Float32Array in NCHW format (normalized)
    const tensorData = new Float32Array(1 * 3 * inputHeight * inputWidth);
    const pixels = imageData.data; // Uint8ClampedArray: [R, G, B, A, R, G, B, A, ...]

    for (let i = 0; i < pixels.length / 4; i++) { // Iterate through pixels
        const R = pixels[i * 4 + 0] / 255.0;
        const G = pixels[i * 4 + 1] / 255.0;
        const B = pixels[i * 4 + 2] / 255.0;

        const x = i % inputWidth;
        const y = Math.floor(i / inputWidth);

        // Fill tensor data in NCHW format
        tensorData[0 * inputHeight * inputWidth + y * inputWidth + x] = R; // R channel
        tensorData[1 * inputHeight * inputWidth + y * inputWidth + x] = G; // G channel
        tensorData[2 * inputHeight * inputWidth + y * inputWidth + x] = B; // B channel
    }

    const tensor = new Tensor('float32', tensorData, MODEL_INPUT_SHAPE);
    return { tensor, originalWidth, originalHeight };
}

export interface DetectionBox {
    x1: number; // Top-left x
    y1: number; // Top-left y
    x2: number; // Bottom-right x
    y2: number; // Bottom-right y
    score: number; // Confidence score
    classId: number; // Class index
    className: string; // Class name
}

export function processOutput(outputTensor: Tensor, originalWidth: number, originalHeight: number): DetectionBox[] {
    // ... (Your existing implementation should work if it's pure JS) ...
    const outputData = outputTensor.data as Float32Array;
    const outputShape = outputTensor.dims;
    const numOutputs = outputShape[1];
    const numPredictions = outputShape[2];
    const inputWidth = MODEL_INPUT_SHAPE[3];
    const inputHeight = MODEL_INPUT_SHAPE[2];

    if (numOutputs !== 4 + NUM_CLASSES) {
        console.warn(`Output shape mismatch: Expected ${4 + NUM_CLASSES} outputs, but got ${numOutputs}. Adjust NUM_CLASSES.`);
    }
    const boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> = [];
    for (let i = 0; i < numPredictions; ++i) {
        const baseIndex = i;
        const cx = outputData[baseIndex + 0 * numPredictions];
        const cy = outputData[baseIndex + 1 * numPredictions];
        const w = outputData[baseIndex + 2 * numPredictions];
        const h = outputData[baseIndex + 3 * numPredictions];
        let maxScore = 0;
        let classId = -1;
        for (let j = 0; j < NUM_CLASSES; ++j) {
            const score = outputData[baseIndex + (4 + j) * numPredictions];
            if (score > maxScore) {
                maxScore = score;
                classId = j;
            }
        }
        if (maxScore > CONFIDENCE_THRESHOLD) {
            const x1 = cx - w / 2.0;
            const y1 = cy - h / 2.0;
            const x2 = cx + w / 2.0;
            const y2 = cy + h / 2.0;
            boxes.push({ x1, y1, x2, y2, score: maxScore, classId });
        }
    }
    const nmsResults = applyNMS(boxes, IOU_THRESHOLD);
    const finalDetections: DetectionBox[] = nmsResults.map(box => {
        const clampedX1 = Math.max(0, box.x1);
        const clampedY1 = Math.max(0, box.y1);
        const clampedX2 = Math.min(inputWidth, box.x2);
        const clampedY2 = Math.min(inputHeight, box.y2);
        return {
            x1: Math.round((clampedX1 / inputWidth) * originalWidth),
            y1: Math.round((clampedY1 / inputHeight) * originalHeight),
            x2: Math.round((clampedX2 / inputWidth) * originalWidth),
            y2: Math.round((clampedY2 / inputHeight) * originalHeight),
            score: box.score,
            classId: box.classId,
            className: CLASS_NAMES[box.classId] || `class_${box.classId}`,
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
