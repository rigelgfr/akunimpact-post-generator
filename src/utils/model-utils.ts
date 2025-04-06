import { InferenceSession, Tensor, env } from 'onnxruntime-web';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises'; // Use fs.promises for async file access
import { pathToFileURL } from 'url';

export interface DetectionBox {
    x1: number; // Top-left x
    y1: number; // Top-left y
    x2: number; // Bottom-right x
    y2: number; // Bottom-right y
    score: number; // Confidence score
    classId: number; // Class index
    className: string; // Class name
}

// --- Configuration ---
const MODEL_INPUT_SHAPE = [1, 3, 1280, 1280]; // Your model's input shape B C H W
const MODEL_PATH = path.join(process.cwd(), 'public/models/best.onnx');
// Define the *absolute* filesystem path for server-side loading
const ABSOLUTE_WASM_PATH = path.join(process.cwd(), 'public', 'onnxruntime');

const CONFIDENCE_THRESHOLD = 0.2; // Minimum confidence to keep a detection
const IOU_THRESHOLD = 0.45;       // IoU threshold for Non-Maximum Suppression (NMS)
const NUM_CLASSES = 4;           // ** IMPORTANT: Adjust this to your number of classes **
//                                   Your output shape (1, 8, 33600) suggests 8 = 4 (box) + 4 (classes)
const CLASS_NAMES = ['genshin-uid', 'hsr-uid', 'web-uid', 'zzz-uid']; // ** IMPORTANT: Replace with your actual class names **

// --- ONNX Runtime Session Cache ---
let session: InferenceSession | null = null;
let loadingPromise: Promise<InferenceSession> | null = null;

export async function getSession(): Promise<InferenceSession> {
    if (session) {
        return session;
    }
    if (loadingPromise) {
        return loadingPromise;
    }

    loadingPromise = new Promise(async (resolve, reject) => {
        try {
            console.log('Initializing ONNX Runtime session...');

            const wasmPathUrl = pathToFileURL(ABSOLUTE_WASM_PATH).href;
            // Ensure the URL ends with a slash if it's a directory path,
            // as some loaders might expect this for resolving relative paths within it.
            const wasmPathUrlString = wasmPathUrl.endsWith('/') ? wasmPathUrl : wasmPathUrl + '/';

            console.log(`Setting env.wasm.wasmPaths to URL: ${wasmPathUrlString}`);
            // Set the path using the file:// URL string
            env.wasm.wasmPaths = wasmPathUrlString;

            try {
                const wasmFile = 'ort-wasm-simd-threaded.wasm';
                const mjsFile = 'ort-wasm-simd-threaded.mjs';
                await fs.access(path.join(ABSOLUTE_WASM_PATH, wasmFile));
                await fs.access(path.join(ABSOLUTE_WASM_PATH, mjsFile));
                console.log(`Verified ${wasmFile} and ${mjsFile} exist in ${ABSOLUTE_WASM_PATH}`);
            } catch (fileAccessError: any) {
                 console.error(`Error accessing WASM/MJS files in ${ABSOLUTE_WASM_PATH}:`, fileAccessError);
                 console.error(`!!! Please ensure '${path.basename(fileAccessError.path)}' exists in 'public/onnxruntime' directory !!!`);
                 reject(new Error(`Missing required WASM/MJS file: ${path.basename(fileAccessError.path)}`));
                 return; // Stop execution
            }

            console.log(`Loading model from: ${MODEL_PATH}`);
            // Load the model directly from the filesystem path server-side
            const modelData = await fs.readFile(MODEL_PATH);
            const modelArrayBuffer = modelData.buffer.slice(modelData.byteOffset, modelData.byteOffset + modelData.byteLength);

            // For server-side (Node.js) WASM, execution providers might need specific setup.
            // 'wasm' is usually the default/fallback. Using 'cpu' might be faster if node bindings are installed,
            // but let's stick to WASM as requested.
            const options: InferenceSession.SessionOptions = {
                 executionProviders: ['wasm'], // Explicitly use wasm
                 graphOptimizationLevel: 'all',
            };

            session = await InferenceSession.create(modelArrayBuffer, options);
            console.log('ONNX Runtime session initialized successfully.');
            resolve(session);
        } catch (error) {
            console.error('Error initializing ONNX Runtime session:', error);
            reject(error);
        } finally {
            loadingPromise = null; // Clear the promise once resolved or rejected
        }
    });

    return loadingPromise;
}

// --- Preprocessing ---
export async function preprocessImage(imageBuffer: Buffer): Promise<{ tensor: Tensor, originalWidth: number, originalHeight: number }> {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const originalWidth = metadata.width!;
    const originalHeight = metadata.height!;

    const inputWidth = MODEL_INPUT_SHAPE[3];
    const inputHeight = MODEL_INPUT_SHAPE[2];

    const resizedImageBuffer = await image
        .resize(inputWidth, inputHeight, { fit: 'fill' }) // Use 'fill' to resize exactly, ignoring aspect ratio (common for YOLO)
        .removeAlpha() // Remove alpha channel if present
        .raw() // Get raw pixel data
        .toBuffer();

    // Expected input shape: [batch_size, channels, height, width] -> [1, 3, 1280, 1280]
    const tensorData = new Float32Array(1 * 3 * inputHeight * inputWidth);
    const pixels = new Uint8Array(resizedImageBuffer); // RGBRGB...

    // Normalize and rearrange data from RGBRGB... to RRR...GGG...BBB... (planar)
    for (let y = 0; y < inputHeight; y++) {
        for (let x = 0; x < inputWidth; x++) {
            const R_idx = y * inputWidth * 3 + x * 3 + 0;
            const G_idx = y * inputWidth * 3 + x * 3 + 1;
            const B_idx = y * inputWidth * 3 + x * 3 + 2;

            // Normalize pixel values to [0, 1]
            const R = pixels[R_idx] / 255.0;
            const G = pixels[G_idx] / 255.0;
            const B = pixels[B_idx] / 255.0;

            // Fill tensor data in NCHW format
            tensorData[0 * inputHeight * inputWidth + y * inputWidth + x] = R; // Red channel
            tensorData[1 * inputHeight * inputWidth + y * inputWidth + x] = G; // Green channel
            tensorData[2 * inputHeight * inputWidth + y * inputWidth + x] = B; // Blue channel
        }
    }

    const tensor = new Tensor('float32', tensorData, MODEL_INPUT_SHAPE);
    return { tensor, originalWidth, originalHeight };
}

// --- Postprocessing (YOLOv8 specific) ---
export function processOutput(outputTensor: Tensor, originalWidth: number, originalHeight: number): DetectionBox[] {
    const outputData = outputTensor.data as Float32Array;
    const outputShape = outputTensor.dims; // Should be [1, 8, 33600]

    const numOutputs = outputShape[1]; // 8 (cx, cy, w, h, class0, class1, ...)
    const numPredictions = outputShape[2]; // 33600
    const inputWidth = MODEL_INPUT_SHAPE[3];
    const inputHeight = MODEL_INPUT_SHAPE[2];

    if (numOutputs !== 4 + NUM_CLASSES) {
        console.warn(`Output shape mismatch: Expected ${4 + NUM_CLASSES} outputs, but got ${numOutputs}. Adjust NUM_CLASSES.`);
        // Proceed cautiously, assuming the first 4 are box coords and the rest are classes
    }

    const boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> = [];

    for (let i = 0; i < numPredictions; ++i) {
        // Extract data for the i-th prediction
        // The data layout is [batch, channel, prediction_index]
        // We need to access elements like outputData[batch * stride_batch + channel * stride_channel + prediction_index]
        // For shape [1, 8, 33600], stride_batch = 8*33600, stride_channel = 33600, stride_pred = 1
        const baseIndex = i; // Since batch is 1
        const cx = outputData[baseIndex + 0 * numPredictions]; // cx at channel 0
        const cy = outputData[baseIndex + 1 * numPredictions]; // cy at channel 1
        const w = outputData[baseIndex + 2 * numPredictions];  // w at channel 2
        const h = outputData[baseIndex + 3 * numPredictions];  // h at channel 3

        // Find the class with the highest score
        let maxScore = 0;
        let classId = -1;
        for (let j = 0; j < NUM_CLASSES; ++j) {
            const score = outputData[baseIndex + (4 + j) * numPredictions];
            if (score > maxScore) {
                maxScore = score;
                classId = j;
            }
        }

        // Filter out low-confidence detections
        if (maxScore > CONFIDENCE_THRESHOLD) {
            // Convert box format from [cx, cy, w, h] (relative to input size) to [x1, y1, x2, y2] (also relative to input size)
            const x1 = cx - w / 2.0;
            const y1 = cy - h / 2.0;
            const x2 = cx + w / 2.0;
            const y2 = cy + h / 2.0;

            boxes.push({
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2,
                score: maxScore,
                classId: classId,
            });
        }
    }

    // Apply Non-Maximum Suppression (NMS)
    const nmsResults = applyNMS(boxes, IOU_THRESHOLD);

    // Scale boxes back to original image dimensions and add class names
    const finalDetections: DetectionBox[] = nmsResults.map(box => {
        // Clamp coordinates to be within the image bounds (0 to input size) before scaling
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
            className: CLASS_NAMES[box.classId] || `class_${box.classId}`, // Fallback name
        };
    });

    return finalDetections;
}

// --- Non-Maximum Suppression (NMS) Implementation ---
export function applyNMS(boxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }>, iouThreshold: number): Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> {
    // Sort boxes by score descending
    boxes.sort((a, b) => b.score - a.score);

    const selectedBoxes: Array<{ x1: number; y1: number; x2: number; y2: number; score: number; classId: number }> = [];

    while (boxes.length > 0) {
        const currentBox = boxes.shift()!; // Take the highest score box
        selectedBoxes.push(currentBox);

        // Remove boxes that have high IoU with the current box *and* are the same class
        boxes = boxes.filter(box => {
            if (box.classId !== currentBox.classId) {
                return true; // Keep boxes of different classes
            }
            const iou = calculateIoU(currentBox, box);
            return iou <= iouThreshold; // Keep boxes with low IoU
        });
    }

    return selectedBoxes;
}

export function calculateIoU(box1: { x1: number; y1: number; x2: number; y2: number }, box2: { x1: number; y1: number; x2: number; y2: number }): number {
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

// Add this to model-utils.ts
export async function detectAndMaskObjects(imageBuffer: Buffer, color: string = '#4086a2'): Promise<Buffer> {
    try {
      // 1. Get original image dimensions
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const originalWidth = metadata.width!;
      const originalHeight = metadata.height!;
      
      // 2. Run object detection
      const session = await getSession();
      const { tensor, originalWidth: width, originalHeight: height } = await preprocessImage(imageBuffer);
      
      const inputName = session.inputNames[0];
      const outputName = session.outputNames[0];
      
      const feeds: Record<string, Tensor> = {};
      feeds[inputName] = tensor;
      
      const results = await session.run(feeds);
      const outputTensor = results[outputName];
      
      if (!outputTensor) {
        throw new Error('Output tensor not found in results');
      }
      
      // 3. Get detection boxes
      const detections = processOutput(outputTensor, width, height);
      
      // 4. Create SVG overlay with rectangles for each detection
      let svgOverlay = `<svg width="${originalWidth}" height="${originalHeight}">`;
      
      detections.forEach(box => {
        svgOverlay += `<rect x="${box.x1}" y="${box.y1}" width="${box.x2 - box.x1}" height="${box.y2 - box.y1}" 
                            fill="${color}" />`;
      });
      
      svgOverlay += '</svg>';
      
      // 5. Composite the original image with the SVG overlay
      const maskedImage = await image
        .composite([{
          input: Buffer.from(svgOverlay),
          gravity: 'northwest'
        }])
        .toBuffer();
      
      return maskedImage;
    } catch (error) {
      console.error('Error in detectAndMaskObjects:', error);
      // Return original image if detection fails
      return imageBuffer;
    }
  }