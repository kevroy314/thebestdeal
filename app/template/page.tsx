'use client';

declare global {
  interface Window {
    cv: any;
    cvLoaded: boolean;
  }
}

import { useEffect, useRef, useState } from 'react';
import React from 'react';

const TEMPLATE_IMAGE_BASE64 = 'data:data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPsAAADYCAYAAAAtSpU+AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuMvu8A7YAAAC2ZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAA8nYBAOgDAADydgEA6AMAAFBhaW50Lk5FVCA1LjEuMgADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAACOO8FX0xe8TgAAA8xJREFUeF7t3T+PVFUcx+G5d9gQN6sxFBQkWtgQgSgxujQbCmNMqOws7GmMnbR0vhVrozZ2Fv7phMQXQGiGhg61EcI4dz3ZzJjZArlzD5zv8yS7czLZ5ncmny3uzD0zn3Hs4cPP5u9efvXsW+cvvPLrb4u/y9MAAAAAsFNdeTx2/fqN7ulyubda7v380w9//fssAAAAAAAAAAAAAAAAAAAAAAAAAI3YOINubMuVstypbqUsq5pq3v+aev5acw5qvdYtvLZ9eQQaJ3YIIXYIIXYIIXYIIXYIIXYIIfYG1Hzfm5eH2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2CGE2AEAAAAAAAAAAAAAAAAAAAAAAABydOVxJ5YrZblT3UpZVjXVvNtMuQcpc66rNfOY8zpwEkKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUKIHUL0t7+4eVDWQMP6c+def1LWQMP6xWIhdgjgDLoR1TqnbDDlHqTMua7WzGPO6wIdhBA7hBA7hBA7hBA7hBA7hBA7AAAAAAAAADyjo6vv7Zcl0KjjD9X0T3sHWEDjjmOfL/fEDgAAAAAAAAAAQBZf/zSiWl8RNJhyD1LmXFdr5jHndeAkhBA7hBA7hBA7hDiJ/asvPz8oS6BBJ7E/WDxwTzs07CT2+/fuix0a5n32EdV6L3Yw5R6kzLmu1sxjzusCHYQQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4QQO4TYiP3Oj1+/VpZAYzZi/+bb793TDo3aiP3und/FDo3aiP3SlbcflyXQGCfVjKjWaSaDKfcgZc51tWYec15X4yGE2CGE2AEAAAAAAAAAAAAAAAAAAAAAAAAAGuPc+BHVOlt8MOUepMy5rtbMY87rdFkIIXYIIXYIIXYIIXYIIXYIIXYIsTX2ow8+3i9LoBFbY1/O5o/LEmjE9ti7+ZOyBBrh47IjqvWRysGUe5Ay57paM485rwt0PLNawfF8xA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hxA4hTo396vsfHpQl0IBTY987c8YBFtCQU2PvZp0DLKAhO70veaob/l+U+6trHXAwmHoPas1a67VOmxcAAAAAAAAAAAAAAAAAAEbgXln+tyuHN7rlctZ33fDT9Svz4dfdX777s/wJLxCx81L69KNPuvNvnp0fHl3sL73zRr9/MOv/ePSov3Z4yz+arWazfwAs/NSTlRfTrQAAAABJRU5ErkJggg==';

export default function Template() {
  const [cv, setCv] = useState<any | null>(null);
  const [xShift, setXShift] = useState(0);
  const [yShift, setYShift] = useState(50);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement>(null);
  const templateImageRef = useRef<HTMLImageElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [sourceLoaded, setSourceLoaded] = useState(false);
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

  // Add useEffect to load template image when component mounts
  useEffect(() => {
    if (templateImageRef.current) {
      const img = new Image();
      img.onload = () => {
        if (templateImageRef.current) {
          templateImageRef.current.width = img.naturalWidth;
          templateImageRef.current.height = img.naturalHeight;
          templateImageRef.current.src = img.src;
          console.log('Template natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
          setTemplateLoaded(true);
        }
      };
      img.src = `${TEMPLATE_IMAGE_BASE64}`;
    }
  }, []);

  // Process images when both are loaded
  useEffect(() => {
    if (!cv || !sourceLoaded || !templateLoaded || !canvasRef.current || !sourceImageRef.current || !templateImageRef.current) return;

    try {
      // Create temporary canvases for proper image loading
      const sourceCanvas = document.createElement('canvas');
      const templateCanvas = document.createElement('canvas');
      
      // Set source canvas size to match original image
      sourceCanvas.width = sourceImageRef.current.naturalWidth;
      sourceCanvas.height = sourceImageRef.current.naturalHeight;
      const sourceCtx = sourceCanvas.getContext('2d');
      sourceCtx?.drawImage(sourceImageRef.current, 0, 0);

      // Set template canvas size to match original image
      templateCanvas.width = templateImageRef.current.naturalWidth;
      templateCanvas.height = templateImageRef.current.naturalHeight;
      const templateCtx = templateCanvas.getContext('2d');
      templateCtx?.drawImage(templateImageRef.current, 0, 0);

      // Read images from the temporary canvases
      const src = cv.imread(sourceCanvas);
      const templ = cv.imread(templateCanvas);
      
      // Check if images are valid
      if (src.empty() || templ.empty()) {
        throw new Error('Failed to load one or both images');
      }

      // Set output canvas dimensions to match source image
      canvasRef.current.width = src.cols;
      canvasRef.current.height = src.rows;

      // Debug log the dimensions
      console.log('Source dimensions:', src.cols, 'x', src.rows);
      console.log('Template dimensions:', templ.cols, 'x', templ.rows);
      
      // Ensure source image is larger than template
      if (src.cols < templ.cols || src.rows < templ.rows) {
        throw new Error(`Template (${templ.cols}x${templ.rows}) must be smaller than source image (${src.cols}x${src.rows})`);
      }

      // Create output image to store results
      const dst = new cv.Mat();
      const mask = new cv.Mat();

      // Convert both images to grayscale for better matching
      const srcGray = new cv.Mat();
      const templGray = new cv.Mat();
      cv.cvtColor(src, srcGray, cv.COLOR_RGBA2GRAY);
      cv.cvtColor(templ, templGray, cv.COLOR_RGBA2GRAY);

      // Try different perspective warps
      let bestMatch = 0;
      let bestLoc = null;
      let bestAngle = 0;

      // Test angles from -30 to 30 degrees in steps of 5
      for (let angle = -30; angle <= 30; angle += 5) {
        const width = templ.cols;
        const height = templ.rows;
        
        // Define source points (rectangle)
        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,              // top-left
          width, 0,          // top-right
          width, height,     // bottom-right
          0, height          // bottom-left
        ]);

        // Define destination points (warped) with separate x and y shifts
        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
          -xShift, -yShift,              // top-left shifts left and up
          width + xShift, -yShift,       // top-right shifts right and up
          width + xShift, height + yShift, // bottom-right shifts right and down
          -xShift, height + yShift        // bottom-left shifts left and down
        ]);

        // Get perspective transform matrix and warp template
        const warpMatrix = cv.getPerspectiveTransform(srcTri, dstTri);
        const warpedTemplate = new cv.Mat();
        cv.warpPerspective(
          templGray,
          warpedTemplate,
          warpMatrix,
          new cv.Size(width, height)
        );

        // Perform template matching with warped template
        cv.matchTemplate(srcGray, warpedTemplate, dst, cv.TM_CCOEFF_NORMED);
        const result = cv.minMaxLoc(dst);

        if (result.maxVal > bestMatch) {
          bestMatch = result.maxVal;
          bestLoc = result.maxLoc;
          bestAngle = angle;
        }

        // Clean up
        warpMatrix.delete();
        warpedTemplate.delete();
        srcTri.delete();
        dstTri.delete();
      }

      // Draw the warped outline at best match location
      if (bestLoc) {
        const width = templ.cols;
        const height = templ.rows;

        // Create points for the warped rectangle with separate x and y shifts
        const points = [
          { x: bestLoc.x - xShift, y: bestLoc.y - yShift },                // top-left
          { x: bestLoc.x + width + xShift, y: bestLoc.y - yShift },        // top-right
          { x: bestLoc.x + width + xShift, y: bestLoc.y + height + yShift }, // bottom-right
          { x: bestLoc.x - xShift, y: bestLoc.y + height + yShift }        // bottom-left
        ];

        // Draw the warped outline
        const contours = new cv.MatVector();
        const contour = cv.matFromArray(4, 1, cv.CV_32SC2, 
          points.flatMap(p => [p.x, p.y])
        );
        contours.push_back(contour);
        
        cv.polylines(src, contours, true, [0, 255, 0, 255], 2);

        // Clean up
        contours.delete();
        contour.delete();

        console.log('Best match angle:', bestAngle, 'degrees');
      }

      // Show result
      cv.imshow(canvasRef.current, src);

      // Clean up
      src.delete();
      templ.delete();
      dst.delete();
      mask.delete();
      srcGray.delete();
      templGray.delete();

    } catch (err) {
      console.error('Error processing image:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Template must be smaller than the source image and both must be valid images'
      );
    }
  }, [cv, sourceLoaded, templateLoaded, xShift, yShift]);

  // Modify the handleSourceUpload function
  const handleSourceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset error state when new image is uploaded
    setError(null);
    // Temporarily set sourceLoaded to false to trigger reprocessing
    setSourceLoaded(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (sourceImageRef.current && e.target?.result) {
        const img = new Image();
        img.onload = () => {
          if (sourceImageRef.current) {
            sourceImageRef.current.width = img.naturalWidth;
            sourceImageRef.current.height = img.naturalHeight;
            sourceImageRef.current.src = img.src;
            console.log('Source natural dimensions:', img.naturalWidth, 'x', img.naturalHeight);
            setSourceLoaded(true);  // This will trigger the processing effect
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
          Template Matching Demo
        </h1>
        <p className="text-gray-700 mb-4">
          This demo shows template matching using OpenCV.js.
          Upload a source image to find matches with the template.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Image:
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSourceUpload}
            className="mb-4"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            X Shift Amount: {xShift}
          </label>
          <input
            type="range"
            min="-200"
            max="200"
            value={xShift}
            onChange={(e) => setXShift(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Y Shift Amount: {yShift}
          </label>
          <input
            type="range"
            min="-200"
            max="200"
            value={yShift}
            onChange={(e) => setYShift(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Source Image:</p>
            <img
              ref={sourceImageRef}
              className="border border-gray-300 w-full h-auto"
              alt="Source"
              style={{ 
                display: sourceLoaded ? 'block' : 'none',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            {!sourceLoaded && (
              <div className="border border-gray-300 h-64 flex items-center justify-center text-gray-500">
                Upload source image
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Template Image:</p>
            <img
              ref={templateImageRef}
              className="border border-gray-300 w-full h-auto"
              alt="Template"
              style={{ 
                maxWidth: '100%',
                height: 'auto'
              }}
            />
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Result:</p>
            <canvas
              ref={canvasRef}
              className="border border-gray-300 w-full h-auto"
              style={{ 
                maxWidth: '100%',
                height: 'auto'
              }}
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