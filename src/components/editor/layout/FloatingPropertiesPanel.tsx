// src/components/editor/layout/FloatingPropertiesPanel.tsx

import { useCadStore, ShapeProperties } from "@/store/useCadStore";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { shallow } from "zustand/shallow";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Droplet, CircleDashed } from 'lucide-react';

const PropertyInput = ({ label, value, onChange, min = 0.01, step = 0.1 }: {
    label: string, value: number, onChange: (v: number) => void, min?: number, step?: number
}) => (
    <div className="grid grid-cols-2 items-center">
        <Label className="text-xs">{label}</Label>
        <Input type="number" value={value?.toFixed(2) ?? 0}
            onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val) && val >= min) onChange(val);
            }}
            step={step} min={min} className="h-7 text-xs"
        />
    </div>
);

export default function FloatingPropertiesPanel() {
    const { selectedObject, updateObjectProperties, updateObjectColor, setObjectHole, recordInteraction } = useCadStore(state => {
        const isSingleSelection = state.selectedObjectIds.length === 1;
        const selectedObject = isSingleSelection ? state.objects[state.selectedObjectIds[0]] : null;
        return {
            selectedObject,
            updateObjectProperties: state.updateObjectProperties,
            updateObjectColor: state.updateObjectColor,
            setObjectHole: state.setObjectHole,
            recordInteraction: state.recordInteraction,
        }
    }, shallow);

    if (!selectedObject) {
        return (
            <div className="absolute top-4 right-4 w-52 bg-background/80 border rounded-lg shadow-lg p-3 backdrop-blur-sm pointer-events-auto">
                <p className="text-sm text-center text-muted-foreground">{useCadStore.getState().selectedObjectIds.length} items selected</p>
            </div>
        );
    }
    
    if (selectedObject.type === 'group') {
        return (
            <div className="absolute top-4 right-4 w-52 bg-background/80 border rounded-lg shadow-lg p-3 backdrop-blur-sm pointer-events-auto">
                <p className="text-sm text-center font-semibold">Group Selected</p>
                <p className="text-xs text-center text-muted-foreground">Ungroup to edit individual shapes.</p>
            </div>
        );
    }

    const handlePropertyChange = (key: keyof ShapeProperties, value: number) => {
        recordInteraction();
        updateObjectProperties(selectedObject.id, { [key]: value });
    }

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        recordInteraction();
        updateObjectColor(selectedObject.id, e.target.value);
    }
    
    const handleHoleToggle = (value: 'solid' | 'hole') => {
        if (value) {
            recordInteraction();
            setObjectHole(selectedObject.id, value === 'hole');
        }
    }

    const props = selectedObject.properties;
    let derivedWidth, derivedHeight, derivedDepth;

    switch(selectedObject.type) {
        case 'box':
            derivedWidth = props.width ?? 0;
            derivedHeight = props.height ?? 0;
            derivedDepth = props.depth ?? 0;
            break;
        case 'sphere':
            derivedWidth = derivedHeight = derivedDepth = (props.radius ?? 0) * 2;
            break;
        case 'cylinder':
        case 'cone':
        case 'wedge':
        case 'gear':
            derivedWidth = derivedDepth = Math.max(props.radiusTop ?? 0, props.radiusBottom ?? 0, props.radius ?? 0) * 2;
            derivedHeight = props.height ?? 0;
            break;
    }

    return (
        <div className="absolute top-4 right-4 w-52 bg-background/80 border rounded-lg shadow-lg p-3 backdrop-blur-sm pointer-events-auto space-y-3">
            <ToggleGroup type="single" value={selectedObject.isHole ? 'hole' : 'solid'} onValueChange={handleHoleToggle} className="w-full grid grid-cols-2">
                <ToggleGroupItem value="solid" className="flex-1 gap-1.5"><Droplet className="h-4 w-4" /> Solid</ToggleGroupItem>
                <ToggleGroupItem value="hole" className="flex-1 gap-1.5"><CircleDashed className="h-4 w-4" /> Hole</ToggleGroupItem>
            </ToggleGroup>
            
            {!selectedObject.isHole && (
                <div className="flex items-center gap-2">
                    <Label className="text-xs">Color</Label>
                    <Input type="color" className="p-0 h-7 w-full" value={selectedObject.color} onChange={handleColorChange}/>
                </div>
            )}
            
            <div className="space-y-1.5">
                {derivedWidth !== undefined && <PropertyInput label="Width (X)" value={derivedWidth} onChange={(v) => {
                    if (props.width !== undefined) handlePropertyChange('width', v);
                    if (selectedObject.type === 'sphere' || selectedObject.type === 'gear') handlePropertyChange('radius', v / 2);
                    if (props.radiusTop !== undefined) handlePropertyChange('radiusTop', v / 2);
                    if (props.radiusBottom !== undefined) handlePropertyChange('radiusBottom', v / 2);
                    if (selectedObject.type === 'cone' || selectedObject.type === 'wedge') handlePropertyChange('radius', v / 2);
                }} />}
                {derivedHeight !== undefined && <PropertyInput label="Height (Y)" value={derivedHeight} onChange={(v) => {
                    if (props.height !== undefined) handlePropertyChange('height', v);
                    if (selectedObject.type === 'sphere') handlePropertyChange('radius', v / 2);
                }} />}
                {derivedDepth !== undefined && <PropertyInput label="Depth (Z)" value={derivedDepth} onChange={(v) => {
                    if (props.depth !== undefined) handlePropertyChange('depth', v);
                    if (selectedObject.type === 'sphere' || selectedObject.type === 'gear') handlePropertyChange('radius', v / 2);
                    if (props.radiusTop !== undefined) handlePropertyChange('radiusTop', v / 2);
                    if (props.radiusBottom !== undefined) handlePropertyChange('radiusBottom', v / 2);
                    if (selectedObject.type === 'cone' || selectedObject.type === 'wedge') handlePropertyChange('radius', v / 2);
                }} />}
                {props.radialSegments !== undefined && selectedObject.type !== 'gear' && <PropertyInput label="Steps" value={props.radialSegments} onChange={(v) => handlePropertyChange('radialSegments', v)} min={3} step={1} />}
                {props.teeth !== undefined && <PropertyInput label="Teeth" value={props.teeth} onChange={(v) => handlePropertyChange('teeth', v)} min={3} step={1} />}
            </div>
        </div>
    );
}