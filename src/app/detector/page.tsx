'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DetectionBox } from '@/utils/model-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

export default function DetectorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [detections, setDetections] = useState<DetectionBox[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<Record<string, number>>({});
    const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageContainerRef = useRef<HTMLDivElement>(null);

    // Clean up ObjectURL
    useEffect(() => {
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
            setError(null);
            setDetections([]);
            setMetrics({});

            const newPreviewUrl = URL.createObjectURL(selectedFile);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(newPreviewUrl);

            // Load image to get dimensions
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
            };
            img.src = newPreviewUrl;
        } else {
            setFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            setDetections([]);
            setError(null);
            setMetrics({});
            setImageSize({ width: 0, height: 0 });
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleDetectClick = useCallback(async () => {
        if (!file) {
            setError('Please select an image file first.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setDetections([]);
        setMetrics({});

        const formData = new FormData();
        formData.append('image', file);

        const startTime = performance.now();

        try {
            const response = await fetch('/api/uid-detection', {
                method: 'POST',
                body: formData,
            });

            const endTime = performance.now();

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

            const apiMetrics = {
                frontendRequestTime: parseFloat(((endTime - startTime) / 1000).toFixed(3)),
            };
            setMetrics(apiMetrics);

            if (result.detections && Array.isArray(result.detections)) {
                setDetections(result.detections);
            } else {
                console.warn("API response format unexpected:", result);
                setError("Received unexpected data format from API.");
            }

        } catch (err: unknown) {
            console.error("Detection API call failed:", err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during detection.');
            setDetections([]);
            setMetrics({});
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    const renderDetections = () => {
        if (!previewUrl || detections.length === 0 || !imageContainerRef.current) return null;

        // Get displayed image dimensions for scaling
        const container = imageContainerRef.current;
        const displayedWidth = container.clientWidth;
        const scaleFactor = displayedWidth / imageSize.width;

        return (
            <div className="relative inline-block mt-4 w-full" ref={imageContainerRef}>
                <img 
                    src={previewUrl} 
                    alt="Detection Preview" 
                    className="max-w-full block rounded-md shadow-md" 
                />
                {detections.map((det, index) => {
                    // Scale coordinates to match displayed image size
                    const style: React.CSSProperties = {
                        position: 'absolute',
                        left: `${det.x1 * scaleFactor}px`,
                        top: `${det.y1 * scaleFactor}px`,
                        width: `${(det.x2 - det.x1) * scaleFactor}px`,
                        height: `${(det.y2 - det.y1) * scaleFactor}px`,
                        border: '2px solid #ef4444',
                        boxSizing: 'border-box',
                        borderRadius: '4px',
                    };
                    
                    return (
                        <div key={index} style={style}>
                            <Badge className="absolute -top-6 left-0 bg-red-500 text-white text-xs font-medium" variant="destructive">
                                {det.className} ({det.score.toFixed(2)})
                            </Badge>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="w-full max-w-3xl mx-auto pt-0">
                <CardHeader className="bg-ai-cyan text-white rounded-t-lg py-2">
                    <div className="flex items-center ">
                        <Camera className="mr-2" size={24} />
                        <div>
                            <CardTitle className="text-2xl font-bold">YOLOv8 Object Detector</CardTitle>
                            <CardDescription className="text-slate-200">
                                Upload an image to detect objects
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={triggerFileInput}>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                ref={fileInputRef}
                                className="hidden"
                            />
                            <Upload size={32} className="text-slate-400 mb-2" />
                            <p className="text-sm text-slate-600 text-center">
                                Click to select an image<br />
                                <span className="text-xs text-slate-500">or drag and drop</span>
                            </p>
                        </div>

                        {previewUrl && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-slate-700 mb-2">Selected Image</h3>
                                <div ref={imageContainerRef} className="max-w-full overflow-hidden rounded-md">
                                    <img
                                        src={previewUrl}
                                        alt="Selected preview"
                                        className="max-w-full rounded-md shadow-sm"
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    {file?.name} ({Math.round(file?.size ? file.size / 1024 : 0)} KB)
                                </p>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive" className="mt-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-center">
                            <Button
                                onClick={handleDetectClick}
                                disabled={!file || isLoading}
                                className="w-full sm:w-auto"
                                variant="default"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Image...
                                    </>
                                ) : (
                                    'Detect Objects'
                                )}
                            </Button>
                        </div>

                        {isLoading && (
                            <div className="mt-4">
                                <p className="text-sm text-slate-600 mb-2">Processing image...</p>
                                <Progress value={45} className="h-2" />
                            </div>
                        )}
                    </div>
                </CardContent>

                {Object.keys(metrics).length > 0 && !isLoading && !error && (
                    <>
                        <Separator />
                        <CardContent className="pt-4">
                            <div className="bg-canva-gray p-3 rounded-md">
                                <h3 className="text-sm font-medium text-slate-800 mb-2">Performance Metrics</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(metrics).map(([key, value]) => (
                                        value !== undefined && (
                                            <div key={key} className="flex justify-between text-sm">
                                                <span className="text-slate-600">{key}:</span>
                                                <span className="font-medium text-slate-800">{value} seconds</span>
                                            </div>
                                        )
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Note: Backend processing times (preprocessing, inference, postprocessing) are not yet included.
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}

                {detections.length > 0 && !isLoading && !error && (
                    <>
                        <Separator />
                        <CardContent className="pt-4">
                            <h3 className="text-sm font-medium text-slate-800 mb-2">Detection Results</h3>
                            {renderDetections()}
                            <div className="mt-3">
                                <p className="text-sm text-slate-600">
                                    Found {detections.length} object{detections.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </CardContent>
                    </>
                )}

                <CardFooter className="flex justify-between text-xs text-slate-500 pt-2 pb-4">
                    <span>Powered by YOLOv8</span>
                    <span>v1.0.0</span>
                </CardFooter>
            </Card>
        </div>
    );
}