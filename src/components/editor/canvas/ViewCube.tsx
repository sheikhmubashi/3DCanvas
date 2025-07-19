// src/components/editor/canvas/ViewCube.tsx

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Box, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useCadStore } from '@/store/useCadStore';

const Face = ({ position, rotation, text, onClick }: { position: [number, number, number], rotation: [number, number, number], text: string, onClick: () => void }) => {
  const [hovered, setHover] = useState(false);
  return (
    <group position={position} rotation={rotation}>
      <Box
        args={[1, 1, 0.05]}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial color={hovered ? '#6699ff' : '#aaaaaa'} />
      </Box>
      <Text
        position={[0, 0, 0.03]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        depthOffset={-1}
      >
        {text}
      </Text>
    </group>
  );
};

export default function ViewCube() {
  const { camera } = useThree();
  const setOrthographicView = useCadStore(state => state.setOrthographicView);
  const cubeRef = useRef<THREE.Group>(null!);

  useFrame(() => {
    // Make the ViewCube always face the same direction as the main camera
    if (cubeRef.current) {
      cubeRef.current.quaternion.copy(camera.quaternion).invert();
    }
  });

  return (
    // This group ensures the ViewCube is positioned in the top-right corner
    // The position values may need tweaking depending on your exact canvas layout/size
    <group position={[3.5, 3.5, 0]} scale={0.4}>
      <group ref={cubeRef}>
        <Face text="FRONT" position={[0, 0, 0.5]} rotation={[0, 0, 0]} onClick={() => setOrthographicView('FRONT')} />
        <Face text="BACK" position={[0, 0, -0.5]} rotation={[0, Math.PI, 0]} onClick={() => setOrthographicView('BACK')} />
        <Face text="TOP" position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} onClick={() => setOrthographicView('TOP')} />
        <Face text="BOTTOM" position={[0, -0.5, 0]} rotation={[Math.PI / 2, 0, 0]} onClick={() => setOrthographicView('BOTTOM')} />
        <Face text="RIGHT" position={[0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} onClick={() => setOrthographicView('RIGHT')} />
        <Face text="LEFT" position={[-0.5, 0, 0]} rotation={[0, -Math.PI / 2, 0]} onClick={() => setOrthographicView('LEFT')} />
      </group>
    </group>
  );
}