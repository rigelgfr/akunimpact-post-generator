// src/app/detector/page.tsx
'use client'; // Required for hooks and event handlers

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Reuse or redefine the DetectionBox interface here
interface DetectionBox {
    x1: number; y1: number; x2: number; y2: number;
    score: number; classId: number; className: string;
}

export default function DetectorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detections, setDetections] = useState<DetectionBox[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    // Optional: To store timings if the API returns them
    const [metrics, setMetrics] = useState<Record<string, number>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Clean up ObjectURL
    useEffect(() => {
        // Revoke the object URL when the component unmounts or previewUrl changes
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null); // Clear previous errors
            setDetections([]); // Clear previous detections
            setMetrics({}); // Clear previous metrics

            // Create a preview URL
            const newPreviewUrl = URL.createObjectURL(selectedFile);
            // Revoke previous URL before setting the new one
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(newPreviewUrl);
        } else {
            // No file selected or selection cancelled
            setFile(null);
            if (previewUrl) {
                 URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            setDetections([]);
            setError(null);
            setMetrics({});
        }
    };

    const handleDetectClick = useCallback(async () => {
        if (!file) {
            setError('Please select an image file first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDetections([]); // Clear previous results
        setMetrics({});

        const formData = new FormData();
        formData.append('image', file);

        const startTime = performance.now(); // Start timing frontend request

        try {
            const response = await fetch('/api/uid-detection', {
                method: 'POST',
                body: formData,
            });

            const endTime = performance.now(); // End timing frontend request

            if (!response.ok) {
                let errorMsg = `HTTP error! Status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorData.message || errorMsg;
                    if (errorData.details) {
                        errorMsg += ` Details: ${errorData.details}`;
                    }
                } catch (jsonError) {
                    // Ignore if response is not JSON
                }
                throw new Error(errorMsg);
            }

            const result = await response.json();

            // --- Metrics Handling ---
            const apiMetrics = {
                frontendRequestTime: parseFloat(((endTime - startTime) / 1000).toFixed(3)),
                // Add backend timings if your API starts returning them
                // e.g., preprocessingTime: result.metrics?.preprocessingTime,
                // inferenceTime: result.metrics?.inferenceTime,
                // postprocessingTime: result.metrics?.postprocessingTime,
            };
            setMetrics(apiMetrics); // Store metrics

            // --- Detections Handling ---
            if (result.detections && Array.isArray(result.detections)) {
                setDetections(result.detections);
            } else {
                console.warn("API response format unexpected:", result);
                setError("Received unexpected data format from API.");
            }

        } catch (err: any) {
            console.error("Detection API call failed:", err);
            setError(err.message || 'An unknown error occurred during detection.');
            setDetections([]); // Clear detections on error
            setMetrics({}); // Clear metrics on error
        } finally {
            setIsLoading(false);
        }
    }, [file]); // Dependency array includes 'file'

    // Helper to draw boxes (optional, can be complex)
    const renderDetections = () => {
        if (!previewUrl || detections.length === 0) return null;

        return (
          <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
            <img src={previewUrl} alt="Detection Preview" style={{ maxWidth: '100%', display: 'block' }} />
            {detections.map((det, index) => {
              // IMPORTANT: These coordinates are relative to the ORIGINAL image size.
              // You'd need the image element's current display size to scale the boxes correctly.
              // This is a simplified example assuming the display size matches original (unlikely)
              const style: React.CSSProperties = {
                position: 'absolute',
                left: `${det.x1}px`, // Needs scaling based on display size vs original size
                top: `${det.y1}px`,  // Needs scaling
                width: `${det.x2 - det.x1}px`, // Needs scaling
                height: `${det.y2 - det.y1}px`, // Needs scaling
                border: '2px solid red',
                boxSizing: 'border-box', // Important for border not adding to size
                color: 'white',
                background: 'rgba(255, 0, 0, 0.3)',
                fontSize: '10px',
                padding: '2px'
              };
              return (
                <div key={index} style={style}>
                  {det.className} ({det.score.toFixed(2)})
                </div>
              );
            })}
          </div>
        );
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>YOLOv8 Object Detector</h1>

            <div>
                <input
                    type="file"
                    accept="image/*" // Accept common image types
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'block', marginBottom: '10px' }}
                />
                {/* Or hide the input and use a button:
                 <button onClick={() => fileInputRef.current?.click()}>Select Image</button>
                 */}
            </div>

            {previewUrl && (
                <div style={{ marginTop: '10px' }}>
                    <img
                        src={previewUrl}
                        alt="Selected preview"
                        style={{ maxWidth: '500px', maxHeight: '500px', display: 'block', marginBottom: '10px' }}
                    />
                </div>
            )}

            <button
                onClick={handleDetectClick}
                disabled={!file || isLoading}
                style={{ padding: '10px 15px', cursor: (file && !isLoading) ? 'pointer' : 'not-allowed' }}
            >
                {isLoading ? 'Detecting...' : 'Detect Objects'}
            </button>

            {isLoading && <p>Loading results...</p>}

            {error && (
                <p style={{ color: 'red', marginTop: '10px' }}>
                    Error: {error}
                </p>
            )}

            {/* Display Metrics */}
             {Object.keys(metrics).length > 0 && !isLoading && !error && (
                <div style={{ marginTop: '20px', background: '#f0f0f0', padding: '10px' }}>
                    <h3>Metrics:</h3>
                    <ul>
                        {Object.entries(metrics).map(([key, value]) => (
                           value !== undefined && <li key={key}>{key}: {value} seconds</li>
                        ))}
                    </ul>
                     <small>Note: Backend processing times (preprocessing, inference, postprocessing) are not yet included by the API.</small>
                </div>
            )}

            {/* Display Detections */}
            {!isLoading && !error && renderDetections()}

        </div>
    );
}