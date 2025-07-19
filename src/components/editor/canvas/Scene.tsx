// src/components/editor/canvas/Scene.tsx

import { useCadStore, type CadObject as CadObjectType, ShapeType } from "@/store/useCadStore";
import { OrbitControls, PerspectiveCamera, Select, Hud } from "@react-three/drei";
import { useThree, useFrame, ThreeEvent } from "@react-three/fiber";
import { useRef, useEffect, useState, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer, Outline, Selection } from "@react-three/postprocessing";
import DimensionHandles from "./DimensionHandles";
import RotationHandles from "./RotationHandles";
import ViewCube from "./ViewCube";
import TWEEN from "@tweenjs/tween.js";
import { shallow } from "zustand/shallow";
import VerticalMoveHandle from "./VerticalMoveHandle";

// --- Helper Functions ---
const getGearGeometry = (radius: number, height: number, teeth: number) => {
    const shape = new THREE.Shape();

    const outerRadius = radius;
    const innerRadius = radius * 0.7;
    const toothTipAngleRatio = 0.5;
    
    const anglePerSection = (Math.PI * 2) / teeth;
    const halfAngle = anglePerSection / 2;
    const toothTipAngle = halfAngle * toothTipAngleRatio;
    const toothBaseAngle = halfAngle - toothTipAngle;

    for (let i = 0; i < teeth; i++) {
        const angle = i * anglePerSection;
        const p0 = new THREE.Vector2(innerRadius * Math.cos(angle - toothBaseAngle), innerRadius * Math.sin(angle - toothBaseAngle));
        const p1 = new THREE.Vector2(outerRadius * Math.cos(angle - toothTipAngle), outerRadius * Math.sin(angle - toothTipAngle));
        const p2 = new THREE.Vector2(outerRadius * Math.cos(angle + toothTipAngle), outerRadius * Math.sin(angle + toothTipAngle));
        const p3 = new THREE.Vector2(innerRadius * Math.cos(angle + toothBaseAngle), innerRadius * Math.sin(angle + toothBaseAngle));
        if (i === 0) shape.moveTo(p0.x, p0.y); else shape.lineTo(p0.x, p0.y);
        shape.lineTo(p1.x, p1.y); 
        shape.lineTo(p2.x, p2.y); 
        shape.lineTo(p3.x, p3.y);
    }
    
    const centerHoleRadius = radius * 0.3;
    const holePath = new THREE.Path();
    holePath.moveTo(centerHoleRadius, 0);
    holePath.absarc(0, 0, centerHoleRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    const extrudeSettings = {
        steps: 1,
        depth: height,
        bevelEnabled: height > 0.1,
        bevelThickness: Math.min(height * 0.1, 0.1),
        bevelSize: Math.min(height * 0.1, 0.1),
        bevelSegments: 2
    };
    
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
};

function isDescendant(parent: THREE.Object3D | null, child: THREE.Object3D | null): boolean {
    if (!parent || !child) return false;
    let node: THREE.Object3D | null = child;
    while (node !== null) {
        if (node === parent) return true;
        node = node.parent;
    }
    return false;
}

const GhostPreview = ({ position }: { position: THREE.Vector3 }) => {
  const { pendingShapeType, getShapeDefaultProperties } = useCadStore();
  const meshRef = useRef<THREE.Mesh>(null!);
  useEffect(() => {
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const size = box.getSize(new THREE.Vector3());
      meshRef.current.position.set(position.x, position.y + size.y / 2, position.z);
    }
  }, [position]);
  if (!pendingShapeType) return null;
  const properties = getShapeDefaultProperties(pendingShapeType);
  const geo = useMemo(() => {
    switch (pendingShapeType) {
      case "box": return <boxGeometry args={[properties.width, properties.height, properties.depth]} />;
      case "sphere": return <sphereGeometry args={[properties.radius, 32, 16]} />;
      case "cylinder": return <cylinderGeometry args={[properties.radiusTop, properties.radiusBottom, properties.height, 32]} />;
      case "cone": return <coneGeometry args={[properties.radius, properties.height, 32]} />;
      case "pyramid": return <cylinderGeometry args={[0, properties.radius, properties.height, 4]} />;
      case "torus": return <torusGeometry args={[properties.radius, properties.tube, 16, 32]} />;
      case "gear": return <primitive object={getGearGeometry(properties.radius!, properties.height!, properties.teeth!)} />;
      default: return <boxGeometry args={[2, 2, 2]} />;
    }
  }, [pendingShapeType, properties]);
  return ( <mesh ref={meshRef}> {geo} <meshStandardMaterial color={"#cccccc"} transparent opacity={0.6} /> </mesh> );
};

function CadObjectComponent({ objectData }: { objectData: CadObjectType }) {
    const { 
        objects, selectObject, selectedObjectIds, recordInteraction, setObjectPosition, 
        setObjectDimensions, setObjectScale, cameraControlsRef, snapSize
    } = useCadStore(state => ({
        objects: state.objects, selectObject: state.selectObject, selectedObjectIds: state.selectedObjectIds,
        recordInteraction: state.recordInteraction, setObjectPosition: state.setObjectPosition,
        setObjectDimensions: state.setObjectDimensions, setObjectScale: state.setObjectScale,
        cameraControlsRef: state.cameraControlsRef, snapSize: state.snapSize
    }), shallow);
    
    const { gl, camera } = useThree();
    const { id, transform, isHole, color } = objectData;
    const isSelected = selectedObjectIds.includes(id);
    const moveHandleRef = useRef<THREE.Group>(null!);
    const verticalHandleRef = useRef<THREE.Group>(null!);
    
    const dragState = useRef<{
        isDragging: boolean;
        mode: 'move' | 'resize' | 'vertical';
        startPos: THREE.Vector3; // World position of the object's origin at the start of the drag
        startHandleWorldPos: THREE.Vector3; // World position of the handle itself at the start of the drag
        startDimensions: { width: number, height: number, depth: number };
        startScale: [number, number, number];
        plane: THREE.Plane; // Plane for XZ movement
        initialPointerOffsetOnPlane: THREE.Vector3; // Offset from pointer intersection to object's origin on the plane
    }>({
        isDragging: false, mode: 'move', startPos: new THREE.Vector3(),
        startHandleWorldPos: new THREE.Vector3(), startDimensions: { width: 1, height: 1, depth: 1 }, startScale: [1,1,1],
        plane: new THREE.Plane(), initialPointerOffsetOnPlane: new THREE.Vector3()
    });

    const geo = useMemo(() => {
        const { type, properties } = objectData;
        const key = JSON.stringify({ ...properties });
        switch (type) {
          case "box": return <boxGeometry key={key} args={[properties.width, properties.height, properties.depth]} />;
          case "sphere": return <sphereGeometry key={key} args={[properties.radius, properties.widthSegments, properties.heightSegments]} />;
          case "cylinder": return <cylinderGeometry key={key} args={[properties.radiusTop, properties.radiusBottom, properties.height, properties.radialSegments]} />;
          case "cone": return <coneGeometry key={key} args={[properties.radius, properties.height, properties.radialSegments]} />;
          case "pyramid": return <cylinderGeometry key={key} args={[0, properties.radius, properties.height, 4, 1]} />;
          case "torus": return <torusGeometry key={key} args={[properties.radius, properties.tube, properties.radialSegments, properties.tubularSegments]} />;
          case "gear": const gearGeo = getGearGeometry(properties.radius!, properties.height!, properties.teeth!); gearGeo.center(); return <primitive object={gearGeo} key={key} />;
          default: return null;
        }
    }, [objectData]);
    
    const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        const state = dragState.current;
        
        const startInteraction = (mode: 'move' | 'resize' | 'vertical') => {
            recordInteraction();
            if (cameraControlsRef?.current) cameraControlsRef.current.enabled = false;
            
            state.isDragging = true;
            state.mode = mode;
            state.startPos.fromArray(transform.position);
            state.startScale = [...transform.scale];
            state.startDimensions = {
                width: Math.abs((objectData.properties.width ?? (objectData.properties.radius ?? 1) * 2) * transform.scale[0]),
                height: Math.abs((objectData.properties.height ?? 1) * transform.scale[1]),
                depth: Math.abs((objectData.properties.depth ?? (objectData.properties.radius ?? 1) * 2) * transform.scale[2])
            };
            
            // Set up the plane for XZ movement (for 'move' mode)
            if (mode === 'move') {
                state.plane.set(new THREE.Vector3(0, 1, 0), -transform.position[1]);
            }
            
            // Calculate the world position of the handle and the initial pointer offset
            const handleWorldPosition = new THREE.Vector3();
            if (e.object.parent && mode === 'vertical') { 
                e.object.parent.getWorldPosition(handleWorldPosition); // Get handle's world position
                state.startHandleWorldPos.copy(handleWorldPosition);
                // Calculate offset from pointer intersection to the handle's origin
                state.initialPointerOffsetOnPlane.copy(e.point); 
            } else if (mode === 'move') {
                // For 'move' mode, the reference is the object's origin on the plane
                state.startHandleWorldPos.copy(transform.position); // Use object's origin
                state.initialPointerOffsetOnPlane.copy(e.point); // Intersection point on the plane
            } else { // 'resize' mode, also use object origin as reference
                state.startHandleWorldPos.copy(transform.position);
                state.initialPointerOffsetOnPlane.copy(e.point);
            }

            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            gl.domElement.style.cursor = mode === 'vertical' ? 'ns-resize' : 'grabbing';
        };

        if (e.button === 0) { // Left click
            selectObject(id, e.shiftKey);
            if (isSelected) {
                const isClickOnVerticalHandle = isDescendant(verticalHandleRef.current, e.object);
                startInteraction(isClickOnVerticalHandle ? 'vertical' : 'resize');
            }
        } else if (e.button === 2 && isSelected) { // Right click on selected object
            e.nativeEvent.preventDefault();
            startInteraction('move');
        }
    };

    const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!dragState.current.isDragging) return;
        e.stopPropagation();
        
        const { mode, startPos, startDimensions, startScale, plane, initialPointerOffsetOnPlane, startHandleWorldPos } = dragState.current;
        const SENSITIVITY = 0.02; // Sensitivity for vertical movement

        if (mode === 'move') {
            const intersection = new THREE.Vector3();
            if (e.ray.intersectPlane(plane, intersection)) {
                const newX = Math.round(intersection.x / snapSize) * snapSize;
                const newZ = Math.round(intersection.z / snapSize) * snapSize;
                setObjectPosition(id, [newX, startPos.y, newZ]);
            }
        } else if (mode === 'vertical') {
            // Calculate the pointer's position on the same plane used for dragging
            const pointerIntersection = new THREE.Vector3();
            if (e.ray.intersectPlane(plane, pointerIntersection)) {
                // Calculate the difference in Y between the current pointer position and the initial pointer offset on the plane.
                // This delta represents the vertical movement in world space.
                const deltaY = pointerIntersection.y - initialPointerOffsetOnPlane.y;
                
                // Calculate the new Y position by adding the delta to the handle's starting world Y position.
                let newY = startHandleWorldPos.y + deltaY;
                
                // Apply snapping to the new Y position
                const snappedY = Math.round(newY / snapSize) * snapSize;
                
                // Update the object's Y position. Keep X and Z from the object's original start position.
                setObjectPosition(id, [startPos.x, snappedY, startPos.z]);
            }
        } 
        else if (mode === 'resize') {
            const scaleAmount = (e.nativeEvent.movementX - e.nativeEvent.movementY) * 0.005;

            if (objectData.type === 'gear') {
                const newHeight = Math.max(0.1, startDimensions.height - (e.nativeEvent.movementY * 0.01));
                const newRadius = Math.max(0.1, startDimensions.width / 2 + (e.nativeEvent.movementX * 0.01));
                setObjectDimensions(id, 'height', newHeight);
                setObjectDimensions(id, 'radius', newRadius * 2);
            } else {
                const newScaleX = Math.max(0.01, startScale[0] + scaleAmount);
                const newScaleY = Math.max(0.01, startScale[1] + scaleAmount);
                const newScaleZ = Math.max(0.01, startScale[2] + scaleAmount);
                setObjectScale(id, [newScaleX, newScaleY, newScaleZ]);
            }
        }
    };

    const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (dragState.current.isDragging) {
            e.stopPropagation();
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            if (cameraControlsRef?.current) cameraControlsRef.current.enabled = true;
            gl.domElement.style.cursor = 'default';
            dragState.current.isDragging = false;
        }
    };

    const MeshContent = geo ? ( <mesh castShadow receiveShadow> {geo} <meshStandardMaterial color={color} roughness={0.8} metalness={0.2} transparent={isHole} opacity={isHole ? 0.5 : 1.0} /> </mesh> ) : null;
    const children = useMemo(() => Object.values(objects).filter(obj => obj.parentId === id), [objects, id]);

    return (
        <group ref={moveHandleRef} position={transform.position} rotation={transform.rotation} scale={transform.scale} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={() => { if (!dragState.current.isDragging) gl.domElement.style.cursor = 'default'; }} onPointerOver={(e) => { e.stopPropagation(); if (!dragState.current.isDragging) gl.domElement.style.cursor = 'pointer'; }} onContextMenu={(e) => { e.nativeEvent.preventDefault(); }}>
            {MeshContent && (isSelected ? <Select>{MeshContent}</Select> : MeshContent)}
            {isSelected && <VerticalMoveHandle ref={verticalHandleRef} object={objectData} />}
            {children.map(child => ( <CadObjectComponent key={child.id} objectData={child} /> ))}
        </group>
    );
};

export default function Scene() {
  const { gl } = useThree();
  const {
    objects, selectedObjectIds, pendingShapeType, snapSize, selectObject,
    setCameraRef, setCameraControlsRef, setLastMousePosition, updateViewCube,
    lastMousePosition, addObject, setPendingShape, setScreenshotFunction,
    setPrimedForMove
  } = useCadStore();

  const orbitControlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const [isPointerOverCanvas, setIsPointerOverCanvas] = useState(false);
  const pendingShapeTypeRef = useRef<ShapeType | null>(null);
  const lastMousePositionRef = useRef<[number, number, number]>([0, 0, 0]);

  useEffect(() => { pendingShapeTypeRef.current = pendingShapeType; }, [pendingShapeType]);
  useEffect(() => { lastMousePositionRef.current = lastMousePosition; }, [lastMousePosition]);

  useEffect(() => {
    const takeScreenshot = () => {
      const link = document.createElement('a');
      link.setAttribute('download', 'fibercad-screenshot.png');
      link.setAttribute('href', gl.domElement.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
      link.click();
    };
    setScreenshotFunction(takeScreenshot);
    return () => setScreenshotFunction(null);
  }, [gl, setScreenshotFunction]);

  useEffect(() => {
    if (cameraRef.current) setCameraRef(cameraRef);
    if (orbitControlsRef.current) setCameraControlsRef(orbitControlsRef);
    const controls = orbitControlsRef.current;
    if (controls) {
      const onChange = () => updateViewCube();
      controls.addEventListener("change", onChange);
      return () => controls.removeEventListener("change", onChange);
    }
  }, [setCameraRef, setCameraControlsRef, updateViewCube]);

  useEffect(() => {
    const handleGlobalPointerUp = (event: PointerEvent) => {
      if (event.target === gl.domElement) {
        const type = pendingShapeTypeRef.current;
        const pos = lastMousePositionRef.current;
        if (type) { addObject(pos); setPendingShape(null); }
      }
    };
    window.addEventListener("pointerup", handleGlobalPointerUp);
    return () => window.removeEventListener("pointerup", handleGlobalPointerUp);
  }, [gl, addObject, setPendingShape]);

  useFrame((state) => {
    TWEEN.update();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    state.raycaster.setFromCamera(state.pointer, state.camera);
    const intersectionPoint = new THREE.Vector3();
    if (state.raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      const snappedX = Math.round(intersectionPoint.x / snapSize) * snapSize;
      const snappedZ = Math.round(intersectionPoint.z / snapSize) * snapSize;
      setLastMousePosition([snappedX, 0, snappedZ]);
    }
  });

  const handleGroundClick = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    selectObject(null);
    setPrimedForMove(null);
  };

  const selectedObject = selectedObjectIds.length === 1 ? objects[selectedObjectIds[0]] : null;
  const topLevelObjects = useMemo(() => Object.values(objects).filter(obj => !obj.parentId), [objects]);
  
  return (
    <>
      <PerspectiveCamera makeDefault ref={cameraRef} position={[20, 20, 20]} fov={40} />
      <OrbitControls ref={orbitControlsRef} makeDefault enableDamping dampingFactor={0.1} />
      <Hud renderPriority={1}> <ambientLight intensity={1.5} /> <directionalLight position={[10, 10, 10]} /> <ViewCube /> </Hud>
      <ambientLight intensity={1.5} />
      <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
      <gridHelper args={[50, 50, "#666666", "#888888"]} position={[0, 0.01, 0]} />
      <mesh rotation-x={-Math.PI / 2} position-y={0} visible={false} onPointerDown={handleGroundClick} onPointerEnter={() => setIsPointerOverCanvas(true)} onPointerLeave={() => setIsPointerOverCanvas(false)} >
        <planeGeometry args={[1000, 1000]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01} receiveShadow> <planeGeometry args={[1000, 1000]} /> <shadowMaterial opacity={0.2} /> </mesh>
      {pendingShapeType && isPointerOverCanvas && ( <GhostPreview position={new THREE.Vector3(...lastMousePosition)} /> )}
      <Selection>
        <EffectComposer multisampling={8} autoClear={false}>
          <Outline blendFunction={THREE.NormalBlending} edgeStrength={100} visibleEdgeColor={0x007BFF} hiddenEdgeColor={0x007BFF} />
        </EffectComposer>
        {topLevelObjects.map(obj => ( <CadObjectComponent key={obj.id} objectData={obj} /> ))}
      </Selection>
      
      {/* RENDER OTHER HANDLES EXTERNALLY */}
      {selectedObject && <RotationHandles object={selectedObject} />}
      {selectedObject && <DimensionHandles object={selectedObject} />}
    </>
  );
}