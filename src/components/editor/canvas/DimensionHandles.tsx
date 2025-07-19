// src/components/editor/canvas/DimensionHandles.tsx

import { Cone, Cylinder } from "@react-three/drei";
import { useCadStore, CadObject } from "@/store/useCadStore";
import * as THREE from 'three';
import { useMemo, useState, useRef } from 'react';
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";

// --- Constants for visuals ---
const HOVER_COLOR = "#00aaff";
const X_AXIS_COLOR = "#ff4d4d"; // Red
const Y_AXIS_COLOR = "#4dff4d"; // Green
const Z_AXIS_COLOR = "#4d4dff"; // Blue
const HANDLE_OPACITY = 0.9;
const SENSITIVITY = 0.05; // Adjust this to change resizing speed

const ResizeArrow = ({ direction, onDrag, isActive }: { direction: THREE.Vector3; onDrag: (...args: any[]) => any, isActive: boolean }) => {
    const [isHovered, setHovered] = useState(false);
    const axisColor = useMemo(() => {
        if (Math.abs(direction.x) > 0.5) return X_AXIS_COLOR;
        if (Math.abs(direction.y) > 0.5) return Y_AXIS_COLOR;
        return Z_AXIS_COLOR;
    }, [direction]);
    const rotation = useMemo(() => {
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
        return new THREE.Euler().setFromQuaternion(quaternion);
    }, [direction]);
    const effectiveColor = isHovered || isActive ? HOVER_COLOR : axisColor;
    return (
        <group {...onDrag()} rotation={rotation} onPointerEnter={(e) => { e.stopPropagation(); setHovered(true); }} onPointerLeave={(e) => { e.stopPropagation(); setHovered(false); }}>
            <Cylinder args={[0.08, 0.08, 1.0, 12]} position={[0, 0.5, 0]}><meshBasicMaterial color={effectiveColor} transparent opacity={HANDLE_OPACITY} /></Cylinder>
            <Cone args={[0.2, 0.4, 16]} position={[0, 1.0, 0]}><meshBasicMaterial color={effectiveColor} transparent opacity={HANDLE_OPACITY} /></Cone>
            <Cylinder args={[0.25, 0.25, 1.4, 12]} position={[0, 0.5, 0]} visible={false} />
        </group>
    );
};

export default function DimensionHandles({ object }: { object: CadObject }) {
    const { setObjectDimensions, setObjectPosition, recordInteraction, cameraControlsRef } = useCadStore.getState();
    const { camera, gl } = useThree();
    const [activeHandleIndex, setActiveHandleIndex] = useState<number | null>(null);
    const { getShapeDefaultProperties } = useCadStore();
    const dragStartRef = useRef<{ position: THREE.Vector3; quaternion: THREE.Quaternion; width: number; height: number; depth: number; } | null>(null);

    const handleDefinitions = useMemo(() => {
        const tempMesh = new THREE.Mesh();
        const props = { ...getShapeDefaultProperties(object.type), ...object.properties };

        switch(object.type) {
            case 'box': tempMesh.geometry = new THREE.BoxGeometry(props.width, props.height, props.depth); break;
            case 'sphere': tempMesh.geometry = new THREE.SphereGeometry(props.radius, props.widthSegments, props.heightSegments); break;
            case 'cylinder': tempMesh.geometry = new THREE.CylinderGeometry(props.radiusTop, props.radiusBottom, props.height, props.radialSegments); break;
            case 'cone': tempMesh.geometry = new THREE.ConeGeometry(props.radius, props.height, props.radialSegments); break;
            case 'pyramid': tempMesh.geometry = new THREE.CylinderGeometry(0, props.radius, props.height, 4); break;
            case 'torus': tempMesh.geometry = new THREE.TorusGeometry(props.radius, props.tube, props.radialSegments, props.tubularSegments); break;
            // FIX: Use a cylinder to represent the gear's bounds accurately, ignoring teeth for this purpose.
            case 'gear': tempMesh.geometry = new THREE.CylinderGeometry(props.radius, props.radius, props.height, 32); break;
            default: tempMesh.geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        tempMesh.scale.set(...object.transform.scale);
        tempMesh.updateMatrixWorld(true);
        
        const box = new THREE.Box3().setFromObject(tempMesh);
        const size = box.getSize(new THREE.Vector3());
        
        const handleOffset = 0.5;
        
        return [
            { dir: new THREE.Vector3(1, 0, 0), pos: [size.x / 2 + handleOffset, 0, 0], size: size },
            { dir: new THREE.Vector3(-1, 0, 0), pos: [-size.x / 2 - handleOffset, 0, 0], size: size },
            { dir: new THREE.Vector3(0, 1, 0), pos: [0, size.y / 2 + handleOffset, 0], size: size },
            { dir: new THREE.Vector3(0, -1, 0), pos: [0, -size.y / 2 - handleOffset, 0], size: size },
            { dir: new THREE.Vector3(0, 0, 1), pos: [0, 0, size.z / 2 + handleOffset], size: size },
            { dir: new THREE.Vector3(0, 0, -1), pos: [0, 0, -size.z / 2 - handleOffset], size: size },
        ];
    }, [object, getShapeDefaultProperties]);

    const createDragHandler = (localAxis: THREE.Vector3, handleIndex: number, currentSize: THREE.Vector3) => {
        return useGesture({
            onDragStart: ({ event }) => {
                event.stopPropagation();
                if (cameraControlsRef?.current) cameraControlsRef.current.enabled = false;
                gl.domElement.style.cursor = 'grabbing';
                recordInteraction();
                setActiveHandleIndex(handleIndex);
                dragStartRef.current = {
                    position: new THREE.Vector3().fromArray(object.transform.position),
                    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler().fromArray(object.transform.rotation)),
                    width: currentSize.x, height: currentSize.y, depth: currentSize.z,
                };
            },
            onDrag: ({ event, movement: [mx, my] }) => {
                event.stopPropagation();
                if (!dragStartRef.current) return;
                const { position, quaternion, width, height, depth } = dragStartRef.current;
                const worldAxis = localAxis.clone().applyQuaternion(quaternion).normalize();
                const camRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
                const camUp = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
                const moveVector = camRight.multiplyScalar(mx).add(camUp.multiplyScalar(-my));
                const totalMoveAmount = moveVector.dot(worldAxis) * SENSITIVITY;
                let dimensionKey: 'width' | 'height' | 'depth';
                let initialDimension: number;
                if (Math.abs(localAxis.x) > 0.5) { dimensionKey = 'width'; initialDimension = width; }
                else if (Math.abs(localAxis.y) > 0.5) { dimensionKey = 'height'; initialDimension = height; }
                else { dimensionKey = 'depth'; initialDimension = depth; }
                const newDimension = Math.max(0.01, initialDimension + totalMoveAmount);
                const dimensionDelta = newDimension - initialDimension;
                setObjectDimensions(object.id, dimensionKey, newDimension);
                const positionOffset = worldAxis.clone().multiplyScalar(dimensionDelta / 2);
                const newPosition = position.clone().add(positionOffset);
                setObjectPosition(object.id, newPosition.toArray() as [number, number, number]);
            },
            onDragEnd: ({ event }) => {
                event.stopPropagation();
                if (cameraControlsRef?.current) cameraControlsRef.current.enabled = true;
                gl.domElement.style.cursor = 'default';
                dragStartRef.current = null;
                setActiveHandleIndex(null);
            },
        }, { eventOptions: { passive: false } });
    };

    return (
        <group position={object.transform.position} rotation={object.transform.rotation}>
            {handleDefinitions.map(({ dir, pos, size }, i) => (
                <group position={pos as [number, number, number]} key={i}>
                    <ResizeArrow direction={dir} onDrag={createDragHandler(dir, i, size)} isActive={activeHandleIndex === i} />
                </group>
            ))}
        </group>
    );
}