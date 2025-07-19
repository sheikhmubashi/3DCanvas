// src/components/editor/canvas/RotationHandles.tsx

import { Html, Torus } from "@react-three/drei";
import { useCadStore, CadObject } from "@/store/useCadStore";
import * as THREE from 'three';
import { useMemo, useRef } from 'react';
import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import { AngleInput } from './AngleInput';

const Protractor = ({ axis, mainGroupRef, onCommit, radius, color }: { axis: 'x' | 'y' | 'z', mainGroupRef: React.RefObject<THREE.Group>, onCommit: (rotation: THREE.Euler) => void, radius: number, color: string }) => {
    const { camera, gl } = useThree();
    const { cameraControlsRef } = useCadStore.getState();
    const bind = useGesture({
        onDragStart: ({ event }) => {
            event.stopPropagation();
            if (cameraControlsRef?.current) cameraControlsRef.current.enabled = false;
            gl.domElement.style.cursor = 'grabbing';
        },
        onDrag: ({ event, delta: [dx, dy] }) => {
            event.stopPropagation();
            if (!mainGroupRef.current) return;
            const worldPos = new THREE.Vector3().setFromMatrixPosition(mainGroupRef.current.matrixWorld);
            const cameraPos = camera.position;
            const viewDir = worldPos.clone().sub(cameraPos).normalize();
            const rotationAxis = new THREE.Vector3(axis === 'x' ? 1 : 0, axis === 'y' ? 1 : 0, axis === 'z' ? 1 : 0);
            const dragDirection = rotationAxis.clone().cross(viewDir).normalize();
            const dragVector = new THREE.Vector2(dx, -dy);
            const directionality = rotationAxis.dot(viewDir) > 0 ? 1 : -1;
            const angle = (dragVector.x * dragDirection.x + dragVector.y * dragDirection.y) * 0.05 * directionality;
            const deltaQuaternion = new THREE.Quaternion().setFromAxisAngle(rotationAxis, angle);
            mainGroupRef.current.quaternion.premultiply(deltaQuaternion);
        },
        onDragEnd: ({ event }) => {
            event.stopPropagation();
            if (mainGroupRef.current) onCommit(new THREE.Euler().setFromQuaternion(mainGroupRef.current.quaternion, 'XYZ'));
            if (cameraControlsRef?.current) cameraControlsRef.current.enabled = true;
            gl.domElement.style.cursor = 'default';
        }
    }, { eventOptions: { passive: false }});
    return (
        <group {...(bind as any)()}>
            <Torus args={[radius, 0.05, 12, 100]} rotation={[axis === 'y' ? 0 : Math.PI/2, axis === 'x' ? 0 : Math.PI/2, 0]}>
                <meshBasicMaterial color={color} transparent opacity={0.7} />
            </Torus>
            <Torus args={[radius, 0.15, 12, 100]} visible={false} rotation={[axis === 'y' ? 0 : Math.PI/2, axis === 'x' ? 0 : Math.PI/2, 0]}/>
        </group>
    );
};

export default function RotationHandles({ object }: { object: CadObject }) {
    const { setObjectRotation, recordInteraction, getShapeDefaultProperties } = useCadStore.getState();
    const mainGroupRef = useRef<THREE.Group>(null!);
    const { camera } = useThree();

    const { ringRadius, panelPosition } = useMemo(() => {
        const tempMesh = new THREE.Mesh();
        const props = { ...getShapeDefaultProperties(object.type), ...object.properties };

        // Create appropriate geometry based on shape type
        switch(object.type) {
            case 'box': tempMesh.geometry = new THREE.BoxGeometry(props.width, props.height, props.depth); break;
            case 'sphere': tempMesh.geometry = new THREE.SphereGeometry(props.radius, props.widthSegments, props.heightSegments); break;
            case 'cylinder': tempMesh.geometry = new THREE.CylinderGeometry(props.radiusTop, props.radiusBottom, props.height, props.radialSegments); break;
            case 'cone': tempMesh.geometry = new THREE.ConeGeometry(props.radius, props.height, props.radialSegments); break;
            case 'pyramid': tempMesh.geometry = new THREE.CylinderGeometry(0, props.radius, props.height, 4); break;
            case 'torus': tempMesh.geometry = new THREE.TorusGeometry(props.radius, props.tube, props.radialSegments, props.tubularSegments); break;
            case 'gear': tempMesh.geometry = new THREE.BoxGeometry(props.radius! * 2, props.height, props.radius! * 2); break; // Approximate
            default: tempMesh.geometry = new THREE.BoxGeometry(1, 1, 1);
        }

        tempMesh.scale.set(...object.transform.scale);
        tempMesh.rotation.fromArray(object.transform.rotation);
        tempMesh.updateMatrixWorld(true);
        
        const box = new THREE.Box3().setFromObject(tempMesh);
        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        
        const objectPosition = new THREE.Vector3().fromArray(object.transform.position);
        const distance = camera.position.distanceTo(objectPosition);
        
        const DYNAMIC_PANEL_OFFSET_FACTOR = 0.1;
        const panelOffset = sphere.radius + 0.5 + (distance * DYNAMIC_PANEL_OFFSET_FACTOR);
        const cameraRight = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(panelOffset);

        return {
            ringRadius: sphere.radius + 0.5,
            panelPosition: cameraRight
        };
    }, [object, camera]);

    const handleCommit = (finalRotation: THREE.Euler) => {
        finalRotation.x = THREE.MathUtils.degToRad(Math.round(THREE.MathUtils.radToDeg(finalRotation.x)));
        finalRotation.y = THREE.MathUtils.degToRad(Math.round(THREE.MathUtils.radToDeg(finalRotation.y)));
        finalRotation.z = THREE.MathUtils.degToRad(Math.round(THREE.MathUtils.radToDeg(finalRotation.z)));
        recordInteraction();
        const finalRotationArray = finalRotation.toArray().slice(0, 3) as [number, number, number];
        setObjectRotation(object.id, finalRotationArray);
    };
    
    const handleInputChange = (axis: 'x' | 'y' | 'z', newAngleDegrees: number) => {
        const euler = new THREE.Euler().fromArray(object.transform.rotation);
        euler[axis] = THREE.MathUtils.degToRad(newAngleDegrees);
        handleCommit(euler);
    };

    const initialQuaternion = useMemo(() => new THREE.Quaternion().setFromEuler(new THREE.Euler().fromArray(object.transform.rotation)), [object.transform.rotation]);

    return (
        <>
            <group ref={mainGroupRef} position={object.transform.position} quaternion={initialQuaternion}>
                <Protractor axis="x" mainGroupRef={mainGroupRef} onCommit={handleCommit} radius={ringRadius} color="#ff4d4d" />
                <Protractor axis="y" mainGroupRef={mainGroupRef} onCommit={handleCommit} radius={ringRadius} color="#4dff4d" />
                <Protractor axis="z" mainGroupRef={mainGroupRef} onCommit={handleCommit} radius={ringRadius} color="#4d4dff" />
            </group>

            <group position={object.transform.position}>
                <Html position={panelPosition} center>
                    <div className="flex flex-col gap-1 p-1 bg-gray-800/80 text-white rounded-lg shadow-xl w-36 pointer-events-auto border border-gray-600">
                        <AngleInput label="X" value={THREE.MathUtils.radToDeg(object.transform.rotation[0])} onChange={(v) => handleInputChange('x', v)} />
                        <AngleInput label="Y" value={THREE.MathUtils.radToDeg(object.transform.rotation[1])} onChange={(v) => handleInputChange('y', v)} />
                        <AngleInput label="Z" value={THREE.MathUtils.radToDeg(object.transform.rotation[2])} onChange={(v) => handleInputChange('z', v)} />
                    </div>
                </Html>
            </group>
        </>
    );
}