"use client";

import { useEffect, useRef, useState } from "react";

interface HeroImageSequenceProps {
  onComplete?: () => void;
}

export default function HeroImageSequence({ onComplete }: HeroImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const totalFrames = 240;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    let loadedCount = 0;
    
    // Start by loading the very first frame immediately so we have a background instantly
    const firstImg = new Image();
    firstImg.src = "/hero-section/ezgif-frame-001.jpg";
    firstImg.onload = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(firstImg, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };

    // Preload all frames
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedIndex = String(i).padStart(3, "0");
      img.src = `/hero-section/ezgif-frame-${paddedIndex}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalFrames) {
          setImagesLoaded(true);
        }
      };
      imagesRef.current.push(img);
    }
  }, []);

  useEffect(() => {
    if (!imagesLoaded || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let animationFrameId: number;

    let lastTime = 0;
    const fpsInterval = 1000 / 24; // 24 FPS target
    
    const throttledRenderLoop = (time: number) => {
      animationFrameId = requestAnimationFrame(throttledRenderLoop);
      const elapsed = time - lastTime;
      
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval);
        
        frame = (frame + 1) % totalFrames;
        
        // Check if we hit the end of the first loop
        if (frame === totalFrames - 1 && !hasCompletedRef.current) {
          hasCompletedRef.current = true;
          if (onComplete) onComplete();
        }

        const img = imagesRef.current[frame];
        
        if (img && img.complete && img.naturalHeight !== 0) {
          const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
          const x = (canvas.width / 2) - (img.width / 2) * scale;
          const y = (canvas.height / 2) - (img.height / 2) * scale;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        }
      }
    };
    
    animationFrameId = requestAnimationFrame(throttledRenderLoop);

    return () => cancelAnimationFrame(animationFrameId);
  }, [imagesLoaded, onComplete]);

  // Handle Resize & DPI
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const dpr = window.devicePixelRatio || 1;
        // Scale internal resolution to match screen density
        canvasRef.current.width = window.innerWidth * dpr;
        canvasRef.current.height = window.innerHeight * dpr;
        // Keep CSS dimensions the same as the window
        canvasRef.current.style.width = `${window.innerWidth}px`;
        canvasRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial set
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="absolute inset-0 z-0 bg-black w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover brightness-75"
      />
      {/* Fallback before load or if disabled */}
      {!imagesLoaded && (
        <img 
          src="/hero-section/ezgif-frame-001.jpg" 
          alt="Loading sequence..." 
          className="absolute inset-0 w-full h-full object-cover brightness-75 transition-opacity duration-1000"
        />
      )}
    </div>
  );
}
