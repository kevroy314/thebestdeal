'use client';

import { useEffect, useRef, useState } from 'react';
import React from 'react';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [cv, setCv] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  let processVideoRef: NodeJS.Timeout | null = null;
  
  useEffect(() => {
    // Load OpenCV.js
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      setCv(window.cv);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  useEffect(() => {
    console.log("useEffect");
    if (!cv || !videoRef.current || !canvasRef.current) return;

    let cleanup: (() => void) | null = null;
      let processVideoRef: NodeJS.Timeout | null = null;

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

      let video = videoRef.current;
      let cap = new cv.VideoCapture(video);
      console.log("Capturing video");
      let dummyFrame = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      cap.read(dummyFrame);
      cap.read(dummyFrame);
      // take first frame of the video
      let frame1 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      cap.read(frame1);

      let prvs = new cv.Mat();
      cv.cvtColor(frame1, prvs, cv.COLOR_RGBA2GRAY);
      frame1.delete();
      let hsv = new cv.Mat();
      let hsv0 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      let hsv1 = new cv.Mat(video.height, video.width, cv.CV_8UC1, new cv.Scalar(255));
      let hsv2 = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      let hsvVec = new cv.MatVector();
      hsvVec.push_back(hsv0); hsvVec.push_back(hsv1); hsvVec.push_back(hsv2);

      let frame2 = new cv.Mat(video.height, video.width, cv.CV_8UC4);
      let next = new cv.Mat(video.height, video.width, cv.CV_8UC1);
      let flow = new cv.Mat(video.height, video.width, cv.CV_32FC2);
      let flowVec = new cv.MatVector();
      let mag = new cv.Mat(video.height, video.width, cv.CV_32FC1);
      let ang = new cv.Mat(video.height, video.width, cv.CV_32FC1);
      let rgb = new cv.Mat(video.height, video.width, cv.CV_8UC3);
      const FPS = 30;
      console.log("processVideoRef");
      processVideoRef = null;
      function processVideo() {
        console.log("processVideo");
        try {
          if (!isStreaming) {
            // Clean and stop
            prvs.delete(); hsv.delete(); hsv0.delete(); hsv1.delete(); hsv2.delete();
            hsvVec.delete(); frame2.delete(); flow.delete(); flowVec.delete(); next.delete();
            mag.delete(); ang.delete(); rgb.delete();
            return;
          }
          let begin = Date.now();

          // start processing.
          cap.read(frame2);
          cv.cvtColor(frame2, next, cv.COLOR_RGBA2GRAY);
          cv.calcOpticalFlowFarneback(prvs, next, flow, 0.5, 3, 15, 3, 5, 1.2, 0);
          cv.split(flow, flowVec);
          let u = flowVec.get(0);
          let v = flowVec.get(1);
          cv.cartToPolar(u, v, mag, ang);
          u.delete(); v.delete();
          ang.convertTo(hsv0, cv.CV_8UC1, 180/Math.PI/2);
          cv.normalize(mag, hsv2, 0, 255, cv.NORM_MINMAX, cv.CV_8UC1);
          cv.merge(hsvVec, hsv);
          cv.cvtColor(hsv, rgb, cv.COLOR_HSV2RGB);
          cv.imshow('canvasOutput', rgb);
          next.copyTo(prvs);

          // schedule the next one.
          let delay = 1000/FPS - (Date.now() - begin);
          processVideoRef = setTimeout(processVideo, delay);
          console.log(delay);
        } catch (err) {
          console.log("processVideo error");
          console.error(err);
          console.log(cv.exceptionFromPtr(err))
          // const delay = 1000 / FPS - (Date.now() - begin);
          // processVideoRef = window.setTimeout(processVideo, delay);
        }
      }

      // Start processing
      processVideo();

      cleanup = () => {
        setIsStreaming(false);
        // clearTimeout(processVideoRef);
        if (videoRef.current?.srcObject) {
          const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
          tracks.forEach(track => track.stop());
        }
      };
    }

    setupCamera();

    return () => {
      if (cleanup) cleanup();
    };
  }, [cv]);

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
        </div>
      </div>
    </main>
  );
} 