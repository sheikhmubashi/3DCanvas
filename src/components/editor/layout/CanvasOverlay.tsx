// src/components/editor/layout/CanvasOverlay.tsx

import { Button } from "@/components/ui/button";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
} from "@/components/ui/select";
import { useCadStore } from "@/store/useCadStore";
import { Home, ZoomIn, ZoomOut, Maximize, View } from "lucide-react";
import * as THREE from "three";

const OverlayButton = ({
 onClick,
 title,
 children,
}: {
 onClick: () => void;
 title: string;
 children: React.ReactNode;
}) => (
 <Tooltip>
  <TooltipTrigger asChild>
   <Button
    variant="secondary"
    size="icon"
    title={title}
    onClick={onClick}
    className="w-12 h-12 rounded-full bg-transparent backdrop-blur-sm text-gray-800 border border-gray-400"
   >
    {children}
   </Button>
  </TooltipTrigger>
  <TooltipContent side="right">
   <p>{title}</p>
  </TooltipContent>
 </Tooltip>
);

export default function CanvasOverlay() {
 const {
  cameraRef,
  cameraControlsRef,
  viewCubeLabels,
  snapSize,
  setSnapSize,
  objects,
 } = useCadStore();

 const snapOptions = [0.1, 0.5, 1.0, 2.0, 5.0];

 // === NEW: Working camera control functions for OrbitControls ===
 const home = () => {
  const controls = cameraControlsRef?.current;
  const camera = cameraRef?.current;
  if (controls && camera) {
   controls.reset();
   // Manually set camera position for a consistent home view
   camera.position.set(10, 10, 10);
   controls.target.set(0, 0, 0);
   camera.zoom = 1;
   camera.updateProjectionMatrix();
  }
 };

 const zoom = (factor: number) => {
  const camera = cameraRef?.current;
  if (camera) {
   camera.zoom = Math.max(0.1, Math.min(camera.zoom * factor, 10));
   camera.updateProjectionMatrix();
  }
 };

 const zoomIn = () => zoom(1.2);
 const zoomOut = () => zoom(0.8);

 const setView = (direction: "TOP" | "FRONT" | "RIGHT") => {
  const controls = cameraControlsRef?.current;
  const camera = cameraRef?.current;
  if (!controls || !camera) return;

  const distance = camera.position.distanceTo(controls.target);
  const newPos = new THREE.Vector3(0, 0, 0);
  const safeDistance = Math.max(distance, 10);

  switch (direction) {
   case "TOP":
    newPos.set(0, safeDistance, 0);
    break;
   case "FRONT":
    newPos.set(0, 0, safeDistance);
    break;
   case "RIGHT":
    newPos.set(safeDistance, 0, 0);
    break;
  }

  camera.position.copy(newPos);
  controls.target.set(0, 0, 0);
  camera.zoom = 1;
  camera.updateProjectionMatrix();
 };

 const zoomToFit = () => {
  const controls = cameraControlsRef?.current;
  const camera = cameraRef?.current;
  if (!controls || !camera) return;

  const allObjs = Object.values(objects);
  if (allObjs.length === 0) {
   home();
   return;
  }

  const box = new THREE.Box3();
  allObjs
   .filter((obj) => !obj.parentId)
   .forEach((objData) => {
    const tempObj = new THREE.Object3D();
    tempObj.position.fromArray(objData.transform.position);
    tempObj.quaternion.setFromEuler(
     new THREE.Euler(...objData.transform.rotation)
    );
    tempObj.scale.fromArray(objData.transform.scale);
    tempObj.updateMatrixWorld();
    box.expandByObject(tempObj);
   });

  const isBoxFinite = isFinite(box.min.x) && isFinite(box.max.x);
  if (box.isEmpty() || !isBoxFinite) {
   home();
   return;
  }

  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = camera.fov * (Math.PI / 180);
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
  cameraZ *= 1.5; // Padding
  cameraZ = Math.max(cameraZ, 5); // Minimum distance

  controls.target.copy(center);
  camera.position.set(center.x, center.y, center.z + cameraZ);
  camera.zoom = 1;
  camera.updateProjectionMatrix();
 };

 return (
  <div className="absolute inset-0 pointer-events-none">
   {/* View Cube */}
   <div className="absolute top-4 right-20 w-24 h-24 grid grid-cols-3 gap-10 grid-rows-3 text-xs font-bold pointer-events-auto">
    <div />
    <Button
     variant="ghost"
     className="w-full h-12 min-w-20"
     onClick={() => setView("TOP")}
    >
     {viewCubeLabels.y}
    </Button>
    <div />
    <Button
     variant="ghost"
     className="w-full h-12 min-w-20"
     onClick={() => setView("RIGHT")}
    >
     {viewCubeLabels.x}
    </Button>
    <div className="bg-muted/60 flex items-center justify-center rounded-md"></div>
    <Button
     variant="ghost"
     className="w-full  min-w-20 h-12"
     onClick={() => setView("FRONT")}
    >
     {viewCubeLabels.z}
    </Button>
   </div>

   {/* Left Overlay */}
   <div
    className="absolute top-4 left-4 flex flex-col gap-3 pointer-events-auto"
    style={{ margin: "9rem 0" }}
   >
    <TooltipProvider delayDuration={100}>
     <OverlayButton onClick={home} title="Home View">
      <Home className="h-6 w-6" />
     </OverlayButton>
     <OverlayButton onClick={zoomToFit} title="Zoom to Fit">
      <Maximize className="h-6 w-6" />
     </OverlayButton>
     <OverlayButton onClick={zoomIn} title="Zoom In">
      <ZoomIn className="h-6 w-6" />
     </OverlayButton>
     <OverlayButton onClick={zoomOut} title="Zoom Out">
      <ZoomOut className="h-6 w-6" />
     </OverlayButton>
     <OverlayButton onClick={() => setView("TOP")} title="Top View">
      <View className="h-6 w-6" />
     </OverlayButton>
    </TooltipProvider>
   </div>

   {/* Snap Grid Dropdown */}
   <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-background/80 rounded-lg border backdrop-blur-sm pointer-events-auto">
    <Label>Snap Grid:</Label>
    <Select
     value={snapSize.toString()}
     onValueChange={(val) => setSnapSize(parseFloat(val))}
    >
     <SelectTrigger className="w-[80px] h-8">
      <SelectValue />
     </SelectTrigger>
     <SelectContent>
      {snapOptions.map((opt) => (
       <SelectItem key={opt} value={opt.toString()}>
        {opt.toFixed(1)} mm
       </SelectItem>
      ))}
     </SelectContent>
    </Select>
   </div>
  </div>
 );
}
