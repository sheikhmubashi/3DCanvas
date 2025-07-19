// src/components/editor/canvas/TransformHandles.tsx

import { Box, Torus } from '@react-three/drei';
import * as THREE from 'three';
import { useGesture } from '@use-gesture/react';
import { CadObject, useCadStore } from '@/store/useCadStore';
import { useThree } from '@react-three/fiber';
import { useRef } from 'react';

// Sub-component for a single Resize Handle
const ResizeHandle = ({ onDrag, color, cursor, ...props }: any) => {
    const { gl } = useThree();
    return (
        <Box 
            args={[0.2, 0.2, 0.2]} // Increased from 0.1 to 0.2
            {...props} {...onDrag()} 
            onPointerOver={() => (gl.domElement.style.cursor = cursor)} 
            onPointerOut={() => (gl.domElement.style.cursor = 'default')}
        >
            <meshBasicMaterial color={color} />
        </Box>
    );
};

// Sub-component for a single Rotation Handle
const RotateHandle = ({ onDrag, color, ...props }: any) => {
    const { gl } = useThree();
    return (
        <Torus 
            args={[0.6, 0.02, 16, 64]} {...props} {...onDrag()}
            onPointerOver={() => (gl.domElement.style.cursor = 'pointer')}
            onPointerOut={() => (gl.domElement.style.cursor = 'default')}
        >
            <meshBasicMaterial color={color} transparent opacity={0.8} />
        </Torus>
    );
}

export default function TransformHandles({ object }: { object: CadObject }) {
    const { setObjectTransform, recordInteraction } = useCadStore.getState();
    const cameraControls = useCadStore.getState().cameraControlsRef;
    const groupRef = useRef<THREE.Group>(null!);

    const initialTransform = useRef<{ position: THREE.Vector3; scale: THREE.Vector3; rotation: THREE.Quaternion; }>();

    const createResizeHandler = (localAxis: THREE.Vector3) => {
        return useGesture({
            onDragStart: ({ event }) => {
                event.stopPropagation(); 
                recordInteraction(); 
                // FIX: Check if cameraControls is not null before accessing .current
                cameraControls?.current?.(false); 
                initialTransform.current = { position: new THREE.Vector3(...object.transform.position), scale: new THREE.Vector3(...object.transform.scale), rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(...object.transform.rotation)), };
            },
            onDrag: ({ event, delta }) => {
                event.stopPropagation(); if (!initialTransform.current) return;
                const { position, scale, rotation } = initialTransform.current;

                const moveSpeed = 0.01;
                const moveAmount = (delta[0] - delta[1]) * moveSpeed;
                const worldAxis = localAxis.clone().applyQuaternion(rotation);

                const newScale = scale.clone();
                newScale.x += localAxis.x * moveAmount / (object.properties.width ?? 1);
                newScale.y += localAxis.y * moveAmount / (object.properties.height ?? 1);
                newScale.z += localAxis.z * moveAmount / (object.properties.depth ?? 1);
                newScale.max(new THREE.Vector3(0.01, 0.01, 0.01));

                const posOffset = worldAxis.clone().multiplyScalar(moveAmount / 2);
                const newPosition = position.clone().add(posOffset);

                setObjectTransform(object.id, newPosition.toArray(), object.transform.rotation, newScale.toArray());
            },
            onDragEnd: ({ event }) => { 
                event.stopPropagation(); 
                // FIX: Check if cameraControls is not null before accessing .current
                cameraControls?.current?.(true); 
            },
        });
    };

    const createRotationHandler = (localAxis: THREE.Vector3) => {
        return useGesture({
            onDragStart: ({ event }) => { 
                event.stopPropagation(); 
                recordInteraction(); 
                // FIX: Check if cameraControls is not null before accessing .current
                cameraControls?.current?.(false); 
                initialTransform.current = { rotation: new THREE.Quaternion().setFromEuler(new THREE.Euler(...object.transform.rotation)), position: new THREE.Vector3(), scale: new THREE.Vector3() }; 
            },
            onDrag: ({ event, movement: [mx, my] }) => {
                event.stopPropagation(); if (!initialTransform.current) return;
                
                const angle = (mx + my) * -0.01;
                const deltaRotation = new THREE.Quaternion().setFromAxisAngle(localAxis, angle);
                const newRotation = initialTransform.current.rotation.clone().multiply(deltaRotation);
                
                const finalEuler = new THREE.Euler().setFromQuaternion(newRotation);
                setObjectTransform(object.id, object.transform.position, [finalEuler.x, finalEuler.y, finalEuler.z], object.transform.scale);
            },
            onDragEnd: ({ event }) => { 
                event.stopPropagation(); 
                // FIX: Check if cameraControls is not null before accessing .current
                cameraControls?.current?.(true); 
            },
        });
    };

    const { width: w = 1, height: h = 1, depth: d = 1 } = object.properties;

    return (
        <group ref={groupRef} position={object.transform.position}>
            {/* Box and handles are inside a rotating group to stay aligned */}
            <group scale={object.transform.scale} rotation={object.transform.rotation}>
                <Box args={[w, h, d]}><meshBasicMaterial color="royalblue" wireframe transparent opacity={0.5} /></Box>
                
                <ResizeHandle color="white" cursor="ns-resize" position={[0, h / 2, 0]} onDrag={createResizeHandler(new THREE.Vector3(0, 1, 0))} />
                <ResizeHandle color="black" cursor="ns-resize" position={[0, -h / 2, 0]} onDrag={createResizeHandler(new THREE.Vector3(0, -1, 0))} />
                
                <ResizeHandle color="black" cursor="ew-resize" position={[w / 2, 0, 0]} onDrag={createResizeHandler(new THREE.Vector3(1, 0, 0))} />
                <ResizeHandle color="black" cursor="ew-resize" position={[-w / 2, 0, 0]} onDrag={createResizeHandler(new THREE.Vector3(-1, 0, 0))} />
                
                <ResizeHandle color="black" cursor="ew-resize" position={[0, 0, d / 2]} onDrag={createResizeHandler(new THREE.Vector3(0, 0, 1))} />
                <ResizeHandle color="black" cursor="ew-resize" position={[0, 0, -d / 2]} onDrag={createResizeHandler(new THREE.Vector3(0, 0, -1))} />
            </group>
            
            <RotateHandle color="red" rotation={[0, Math.PI / 2, 0]} onDrag={createRotationHandler(new THREE.Vector3(1, 0, 0))} />
            <RotateHandle color="green" rotation={[Math.PI / 2, 0, 0]} onDrag={createRotationHandler(new THREE.Vector3(0, 1, 0))} />
            <RotateHandle color="blue" rotation={[0, 0, 0]} onDrag={createRotationHandler(new THREE.Vector3(0, 0, 1))} />
        </group>
    );
}