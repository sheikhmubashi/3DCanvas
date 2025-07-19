import React from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface GridHelperProps {
  snapSize: number;
}

const GridHelper: React.FC<GridHelperProps> = ({ snapSize }) => {
  const { scene } = useThree();

  React.useEffect(() => {
    // Create enhanced grid helper
    const gridHelper = new THREE.GridHelper(40, 40 / snapSize, 0x4fc3f7, 0x81d4fa);
    gridHelper.position.y = 0.005;
    scene.add(gridHelper);

    // Add measurement markers
    const markerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const markerMaterial = new THREE.MeshBasicMaterial({ color: 0x4fc3f7 });

    for (let i = -20; i <= 20; i += snapSize * 5) {
      for (let j = -20; j <= 20; j += snapSize * 5) {
        const marker = new THREE.Mesh(markerGeometry, markerMaterial);
        marker.position.set(i, 0.01, j);
        scene.add(marker);
      }
    }

    return () => {
      scene.remove(gridHelper);
      // Clean up markers
      const markersToRemove = scene.children.filter(child => 
        child instanceof THREE.Mesh && child.material === markerMaterial
      );
      markersToRemove.forEach(marker => scene.remove(marker));
    };
  }, [snapSize, scene]);

  return null;
};

export default GridHelper;