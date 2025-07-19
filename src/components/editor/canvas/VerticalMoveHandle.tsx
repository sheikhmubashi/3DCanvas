// src/components/editor/canvas/VerticalMoveHandle.tsx

import { Cone, Cylinder } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import React, { useState, useMemo } from 'react';
import type { CadObject } from "@/store/useCadStore";
import type { Group } from "three";

const HANDLE_COLOR = "#facc15"; // Yellow
const HOVER_COLOR = "#00aaff"; // Blue for hover

const VerticalMoveHandle = React.forwardRef<Group, { object: CadObject }>((props, ref) => {
    const { gl } = useThree();
    const [isHovered, setHovered] = useState(false);

    const objectHeight = useMemo(() => {
        const p = props.object.properties;
        const scaleY = props.object.transform.scale[1];
        return Math.abs((p.height ?? (p.radius ? p.radius * 2 : 1)) * scaleY);
    }, [props.object]);

    return (
        <group ref={ref} position={[0, objectHeight / 2 + 0.8, 0]}>
            <group 
                onPointerEnter={(e) => { 
                    e.stopPropagation(); 
                    setHovered(true); 
                    gl.domElement.style.cursor = 'ns-resize'; 
                }}
                onPointerLeave={(e) => { 
                    e.stopPropagation(); 
                    setHovered(false); 
                    // The parent component will reset cursor on pointer up/drag end
                }}
            >
                <Cylinder args={[0.1, 0.1, 0.8, 12]} position={[0, -0.4, 0]}>
                    <meshBasicMaterial color={isHovered ? HOVER_COLOR : HANDLE_COLOR} />
                </Cylinder>
                <Cone args={[0.25, 0.5, 16]} position={[0, 0, 0]}>
                    <meshBasicMaterial color={isHovered ? HOVER_COLOR : HANDLE_COLOR} />
                </Cone>
                {/* Invisible collider for easier grabbing */}
                <Cylinder args={[0.3, 0.3, 1.4, 12]} position={[0, -0.2, 0]} visible={false} />
            </group>
        </group>
    );
});

VerticalMoveHandle.displayName = "VerticalMoveHandle";

export default VerticalMoveHandle;