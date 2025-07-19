// src/components/editor/canvas/CanvasContainer.tsx

import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Suspense } from "react";
import GridErrorBoundary from "./GridErrorBoundary";

export default function CanvasContainer() {
  return (
    <div className="w-full h-full bg-white">
      <GridErrorBoundary>
        <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading 3D Scene...</div>}>
          <Canvas
            shadows
            gl={{ 
                preserveDrawingBuffer: true,
                antialias: true,
                powerPreference: 'high-performance' 
            }}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </GridErrorBoundary>
    </div>
  );
}