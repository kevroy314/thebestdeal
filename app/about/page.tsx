/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
'use client';

declare global {
  interface Window {
    cv: any;
    cvLoaded: boolean;  // Track if CV is already loaded
  }
}

import { useEffect, useRef, useState } from 'react';
import React from 'react';

// Add template image constant at top of file
const TEMPLATE_IMAGE_BASE64 = 'data:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPsAAADYCAYAAAAtSpU+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMvu8A7YAAAC2ZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAA8nYBAOgDAADydgEA6AMAAFBhaW50Lk5FVCA1LjEuMgADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAACOO8FX0xe8TgAAA8xJREFUeF7t3T+PVFUcx+G5d9gQN6sxFBQkWtgQgSgxujQbCmNMqOws7GmMnbR0vhVrozZ2Fv7phMQXQGiGhg61EcI4dz3ZzJjZArlzD5zv8yS7czLZ5ncmny3uzD0zn3Hs4cPP5u9efvXsW+cvvPLrb4u/y9MAAAAAsFNdeTx2/fqN7ulyubda7v380w9//fssAAAAAAAAAAAAAAAAAAAAAAAAAI3YOINubMuVstypbqUsq5pq3v+aev5acw5qvdYtvLZ9eQQaJ3YIIXYIIXYIIXYIIXYIIXYIIfYG1Hzfm5eH2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2AEAAAAAAAAAAAAAAAAAAAAAAABydOVxJ5YrZblT3UpZVjXVvNtMuQcpc66rNfOY8zpwEkKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUL0t7+4eVDWQMP6c+def1LWQMP6xWIhdgjgDLoR1TqnbDDlHqTMua7WzGPO6wIdhBA7hBA7hBA7hBA7hBA7hBA7AAAAAAAAADyjo6vv7Zcl0KjjD9X0T3sHWEDjjmOfL/fEDgAAAAAAAAAAQBZf/zSiWl8RNJhyD1LmXFdr5jHndeAkhBA7hBA7hBA7hDiJ/asvPz8oS6BBJ7E/WDxwTzs07CT2+/fuix0a5n32EdV6L3Yw5R6kzLmu1sxjzusCHYQQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4TYiP3Oj1+/VpZAYzZi/+bb793TDo3aiP3und/FDo3aiP3SlbcflyXQGCfVjKjWaSaDKfcgZc51tWYec15X4yGE2CGE2AEAAAAAAAAAAAAAAAAAAAAAAAAAGuPc+BHVOlt8MOUepMy5rtbMY87rdFkIIXYIIXYIIXYIIXYIIXYIIXYIsTX2ow8+3i9LoBFbY1/O5o/LEmjE9ti7+ZOyBBrh47IjqvWRysGUe5Ay57paM485rwt0PLNawfF8xA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hTo396vsfHpQl0IBTY987c8YBFtCQU2PvZp0DLKAhO70veaob/l+U+6trHXAwmHoPas1a67VOmxcAAAAAAAAAAAAAAAAAAEbgXln+tyuHN7rlctZ33fDT9Svz4dfdX777s/wJLxCx81L69KNPuvNvnp0fHl3sL73zRr9/MOv/ePSov3Z4yz+arWazfwAs/NSTlRfTrQAAAABJRU5ErkJggg==';


export default function About() {
  const [cv, setCv] = useState<any | null>(null);
  const [threshold, setThreshold] = useState(240);
  const [cannyLow, setCannyLow] = useState(0);
  const [cannyHigh, setCannyHigh] = useState(255);
  const [houghThreshold, setHoughThreshold] = useState(28);
  const [houghRho, setHoughRho] = useState(1);
  const [houghTheta, setHoughTheta] = useState(Math.PI / 180);
  const [minTheta, setMinTheta] = useState(-Math.PI);
  const [maxTheta, setMaxTheta] = useState(Math.PI);
  const [intersectionThreshold, setIntersectionThreshold] = useState(0.15);
  const [intersectionMargin, setIntersectionMargin] = useState(100);
  const [angleThreshold, setAngleThreshold] = useState(15);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputImageRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Add template image ref and state
  const templateImageRef = useRef<HTMLImageElement>(null);
  const [templateLoaded, setTemplateLoaded] = useState(false);

  // Load OpenCV
  useEffect(() => {
    if (!window.cvLoaded) {
      console.log('Loading OpenCV.js');
      const script = document.createElement('script');
      script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
      script.async = true;
      script.onload = () => {
        console.log('OpenCV.js loaded');
        window.cvLoaded = true;
        setCv(window.cv);
      };
      document.body.appendChild(script);

      return () => {
        if (!window.cvLoaded) {
          document.body.removeChild(script);
        }
      };
    } else {
      console.log('OpenCV.js already loaded');
      setCv(window.cv);
    }
  }, []);

  // Modify the template loading effect
  useEffect(() => {
    if (templateImageRef.current) {
      const img = new Image();
      img.onload = () => {
        if (templateImageRef.current) {
          console.log('Template image loaded with dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          templateImageRef.current.width = img.naturalWidth;
          templateImageRef.current.height = img.naturalHeight;
          templateImageRef.current.src = img.src;
          setTemplateLoaded(true);
        }
      };
      img.onerror = (err) => {
        console.error('Error loading template image:', err);
        setError('Failed to load template image');
      };
      console.log('Setting template image source');
      img.src = TEMPLATE_IMAGE_BASE64;
    }
  }, []);

  // Modify the image processing useEffect
  useEffect(() => {
    if (!cv || !imageLoaded || !canvasRef.current || !inputImageRef.current || !templateLoaded) return;

    try {
      // Create temporary canvases for proper image loading
      const sourceCanvas = document.createElement('canvas');
      const templateCanvas = document.createElement('canvas');
      
      // Set source canvas size to match original image
      sourceCanvas.width = inputImageRef.current.naturalWidth;
      sourceCanvas.height = inputImageRef.current.naturalHeight;
      const sourceCtx = sourceCanvas.getContext('2d');
      sourceCtx?.drawImage(inputImageRef.current, 0, 0);

      // Set template canvas size to match original image
      templateCanvas.width = templateImageRef.current.naturalWidth;
      templateCanvas.height = templateImageRef.current.naturalHeight;
      const templateCtx = templateCanvas.getContext('2d');
      templateCtx?.drawImage(templateImageRef.current, 0, 0);

      // Read images from the temporary canvases
      const src = cv.imread(sourceCanvas);
      const templ = cv.imread(templateCanvas);
      
      // Perform template matching
      const dst = new cv.Mat();
      cv.matchTemplate(src, templ, dst, cv.TM_CCOEFF_NORMED);
      const result = cv.minMaxLoc(dst);
      const maxPoint = result.maxLoc;

      // Extract the region of interest (ROI)
      const roi = src.roi(new cv.Rect(maxPoint.x, maxPoint.y, templ.cols, templ.rows));
      
      // Convert ROI to grayscale
      cv.cvtColor(roi, roi, cv.COLOR_RGBA2GRAY);

      // Apply threshold to ROI
      cv.threshold(roi, roi, threshold, 255, cv.THRESH_BINARY);

      // Edge detection and Hough transform on ROI
      cv.Canny(roi, roi, cannyLow, cannyHigh, 3);
      const lines = new cv.Mat();
      cv.HoughLines(
        roi,
        lines,
        houghRho,
        houghTheta,
        houghThreshold,
        0,
        0,
        minTheta,
        maxTheta
      );

      // Draw lines on original image
      for (let i = 0; i < lines.rows; ++i) {
        const rho = lines.data32F[i * 2];
        const theta = lines.data32F[i * 2 + 1];
        
        // Convert theta to degrees and normalize to 0-180 range
        let angleDegrees = (theta * 180 / Math.PI) % 180;
        // Ensure angle is positive
        if (angleDegrees < 0) angleDegrees += 180;
        
        // For horizontal lines, angle should be close to 90 degrees
        const angleFromHorizontal = Math.abs(90 - angleDegrees);
        
        // Only draw if the angle is close to horizontal (90 degrees)
        if (angleFromHorizontal <= angleThreshold) {
          const a = Math.cos(theta);
          const b = Math.sin(theta);
          const x0 = a * rho + maxPoint.x;
          const y0 = b * rho + maxPoint.y;
          const startPoint = {
            x: x0 - 1000 * b,
            y: y0 + 1000 * a
          };
          const endPoint = {
            x: x0 + 1000 * b,
            y: y0 - 1000 * a
          };
          cv.line(src, startPoint, endPoint, [255, 0, 0, 255]);

          // Debug logging
          console.log('Drawing line with angle:', angleDegrees.toFixed(1), 'degrees');
        }
      }

      // Draw rectangle around matched region
      const point = new cv.Point(maxPoint.x + templ.cols, maxPoint.y + templ.rows);
      cv.rectangle(src, maxPoint, point, [0, 255, 0, 255], 2);

      // Show result
      cv.imshow(canvasRef.current, src);

      // Clean up
      src.delete();
      templ.delete();
      dst.delete();
      roi.delete();
      lines.delete();
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    }
  }, [cv, imageLoaded, templateLoaded, threshold, cannyLow, cannyHigh, houghThreshold, houghRho, houghTheta, minTheta, maxTheta, angleThreshold]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state when new image is uploaded
    setError(null);
    // Temporarily set imageLoaded to false to trigger reprocessing
    setImageLoaded(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (inputImageRef.current && e.target?.result) {
        const img = new Image();
        img.onload = () => {
          if (inputImageRef.current) {
            inputImageRef.current.width = img.naturalWidth;
            inputImageRef.current.height = img.naturalHeight;
            inputImageRef.current.src = img.src;
            console.log('Source natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            setImageLoaded(true);  // This will trigger the processing effect
          }
        };
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          About OpenCV.js Demo
        </h1>
        <p className="text-gray-700 mb-4">
          This demo shows image thresholding and line detection using OpenCV.js.
          Upload an image and adjust the parameters to see the effects in real-time.
        </p>
        
        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="mb-4"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Threshold: {threshold}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hough Threshold: {houghThreshold}
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={houghThreshold}
              onChange={(e) => setHoughThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canny Low: {cannyLow}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={cannyLow}
              onChange={(e) => setCannyLow(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Canny High: {cannyHigh}
            </label>
            <input
              type="range"
              min="0"
              max="255"
              value={cannyHigh}
              onChange={(e) => setCannyHigh(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Angle: {(minTheta * 180 / Math.PI).toFixed(0)}°
            </label>
            <input
              type="range"
              min={-180}
              max={0}
              value={minTheta * 180 / Math.PI}
              onChange={(e) => setMinTheta(Number(e.target.value) * Math.PI / 180)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Angle: {(maxTheta * 180 / Math.PI).toFixed(0)}°
            </label>
            <input
              type="range"
              min={0}
              max={180}
              value={maxTheta * 180 / Math.PI}
              onChange={(e) => setMaxTheta(Number(e.target.value) * Math.PI / 180)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intersection Threshold: {intersectionThreshold}
            </label>
            <input
              type="range"
              min="0.01"
              max="0.5"
              step="0.01"
              value={intersectionThreshold}
              onChange={(e) => setIntersectionThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intersection Margin: {intersectionMargin}
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={intersectionMargin}
              onChange={(e) => setIntersectionMargin(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horizontal Angle Threshold: {angleThreshold}°
            </label>
            <input
              type="range"
              min="1"
              max="45"
              value={angleThreshold}
              onChange={(e) => setAngleThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Input Image:</p>
            <img
              ref={inputImageRef}
              className="border border-gray-300"
              alt="Input"
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
            <img
              ref={templateImageRef}
              className="hidden"
              alt="Template"
            />
            {!imageLoaded && (
              <div className="border border-gray-300 h-64 flex items-center justify-center text-gray-500">
                Upload an image to begin
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Processed Output:</p>
            <canvas
              ref={canvasRef}
              className="border border-gray-300"
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 text-red-600">
            {error}
          </div>
        )}
      </div>
    </main>
  );
} 