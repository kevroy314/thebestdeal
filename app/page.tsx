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

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processVideoRef = useRef<NodeJS.Timeout | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cv, setCv] = useState<any | null>(null); 
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Load OpenCV.js only if not already loaded
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
        // Only remove the script if component unmounts before load
        if (!window.cvLoaded) {
          document.body.removeChild(script);
        }
      };
    } else {
      console.log('OpenCV.js already loaded');
      setCv(window.cv);
    }
  }, []);

  useEffect(() => {
    console.log("useEffect");
    if (!cv || !videoRef.current || !canvasRef.current) return;

    let cleanup: (() => void) | null = null;

    async function setupCamera() {
      try {
        // Wait for document to be ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve);
          });
        }

        // Check if we're on localhost, local network, or HTTPS
        const isLocalNetwork = window.location.hostname.startsWith('192.168.') || 
                             window.location.hostname === 'localhost' || 
                             window.location.hostname === '127.0.0.1';
        const isSecure = window.location.protocol === 'https:';
        
        if (!isLocalNetwork && !isSecure) {
          throw new Error('Camera access requires HTTPS or local network');
        }

        // Check for basic getUserMedia support
        if (!('mediaDevices' in navigator) || !('getUserMedia' in navigator.mediaDevices)) {
          throw new Error('Your browser does not support camera access');
        }

        const constraints = {
          video: {
            facingMode: 'environment',
            frameRate: { ideal: 30 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("setupCamera stream created");
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.width = 640;
          videoRef.current.height = 480;
          videoRef.current.play();
          setIsStreaming(true);
          initializeOpticalFlow();
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(err instanceof Error ? err.message : 'Failed to access camera');
      }
    }

    function initializeOpticalFlow() {
      if (!videoRef.current || !cv) return;

      const video = videoRef.current;
      const cap = new cv.VideoCapture(video);
      console.log("Capturing video");
      const dummyFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      cap.read(dummyFrame);
      cap.read(dummyFrame);
      // take first frame of the video
      const frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      cap.read(frame1);

      const prvs = new cv.Mat();
      cv.cvtColor(frame1, prvs, cv.COLOR_RGBA2GRAY);
      frame1.delete();
      const hsv = new cv.Mat();
      const hsv0 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      const hsv1 = new cv.Mat(video.height, video.width, cv.CV_8UC1, new cv.Scalar(255));
      const hsv2 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      const hsvVec = new cv.MatVector();
      hsvVec.push_back(hsv0); hsvVec.push_back(hsv1); hsvVec.push_back(hsv2);

      const frame2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      const next = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      const flow = new cv.Mat(video.height, video.width, cv.CV_32FC2);
      const flowVec = new cv.MatVector();
      const mag = new cv.Mat(video.height, video.width, cv.CV_32FC1);
      const ang = new cv.Mat(video.height, video.width, cv.CV_32FC1);
      const rgb = new cv.Mat(video.height, video.width, cv.CV_8UC3);
      const FPS = 30;
      console.log("processVideoRef");
      
      function processVideo() {
        console.log("processVideo");
        try {
          if (!isStreaming || !canvasRef.current) {
            console.log("Stopping video processing - stream ended or canvas missing");
            // Clean and stop
            prvs.delete(); hsv.delete(); hsv0.delete(); hsv1.delete(); hsv2.delete();
            hsvVec.delete(); frame2.delete(); flow.delete(); flowVec.delete(); next.delete();
            mag.delete(); ang.delete(); rgb.delete();
            return;
          }

          const begin = Date.now();
          
          // start processing.
          cap.read(frame2);
          cv.cvtColor(frame2, next, cv.COLOR_RGBA2GRAY);
          cv.calcOpticalFlowFarneback(prvs, next, flow, 0.5, 3, 15, 3, 5, 1.2, 0);
          cv.split(flow, flowVec);
          const u = flowVec.get(0);
          const v = flowVec.get(1);
          cv.cartToPolar(u, v, mag, ang);
          u.delete(); v.delete();
          ang.convertTo(hsv0, cv.CV_8UC1, 180/Math.PI/2);
          cv.normalize(mag, hsv2, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
          cv.merge(hsvVec, hsv);
          cv.cvtColor(hsv, rgb, cv.COLOR_HSV2RGB);
          cv.imshow('canvasOutput', rgb);
          next.copyTo(prvs);

          // schedule the next one.
          const delay = 1000/FPS - (Date.now() - begin);
          processVideoRef.current = setTimeout(processVideo, delay);
          console.log(delay);
        } catch (err) {
          console.log("processVideo error");
          console.error(err);
          console.log(cv.exceptionFromPtr(err))
        }
      }

      // Start processing
      processVideo();

      cleanup = () => {
        console.log('Cleaning up camera and processing');
        setIsStreaming(false);
        if (processVideoRef.current) {
          clearTimeout(processVideoRef.current);
        }
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => {
            console.log('Stopping track:', track.kind);
            track.stop();
          });
          videoRef.current.srcObject = null;
        }
      };
    }

    setupCamera();

    return () => {
      console.log('Component unmounting, cleaning up');
      if (cleanup) cleanup();
    };
  }, [cv, isStreaming]);

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          OpenCV.js Optical Flow Demo
        </h1>
        <div className="relative">
          <video
            ref={videoRef}
            id="videoInput"
            className="hidden"
            width="640"
            height="480"
          />
          <canvas
            ref={canvasRef}
            id="canvasOutput"
            className="border border-gray-300"
            width="640"
            height="480"
          />
          {error && (
            <div className="mt-4 text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 