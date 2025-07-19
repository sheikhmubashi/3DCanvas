// src/components/editor/sidebar/PropertiesPanel.tsx

import * as THREE from 'three';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCadStore } from "@/store/useCadStore";
import { ShapeProperties } from '@/store/useCadStore';
import { shallow } from 'zustand/shallow';

const Vector3Input = ({ label, value, onChange, step = 0.1 }: { label: string, value: [number, number, number], onChange: (newValue: [number, number, number]) => void, step?: number }) => {
  const handleChange = (axisIndex: number, val: string) => {
    const num = parseFloat(val) || 0;
    const newValue = [...value] as [number, number, number];
    newValue[axisIndex] = num;
    onChange(newValue);
  };
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <Input type="number" value={value[0].toFixed(2)} onChange={(e) => handleChange(0, e.target.value)} step={step} />
        <Input type="number" value={value[1].toFixed(2)} onChange={(e) => handleChange(1, e.target.value)} step={step} />
        <Input type="number" value={value[2].toFixed(2)} onChange={(e) => handleChange(2, e.target.value)} step={step} />
      </div>
    </div>
  );
};

const PropertyInput = ({ label, value, onChange, min = 0, step = 0.1, isInt = false }: {
    label: string,
    value: number,
    onChange: (newValue: number) => void,
    min?: number,
    step?: number,
    isInt?: boolean
}) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = isInt ? parseInt(e.target.value, 10) : parseFloat(e.target.value);
        if (!isNaN(num)) {
            onChange(num);
        }
    };
    return (
        <div className="grid grid-cols-2 items-center gap-4">
            <Label className="text-sm">{label}</Label>
            <Input type="number" value={value ?? 0} onChange={handleChange} step={step} min={min} />
        </div>
    );
};

const SliderInput = ({ label, value, onChange, min = 0, max = 1, step = 0.01 }: {
    label: string,
    value: number,
    onChange: (newValue: number) => void,
    min?: number,
    max?: number,
    step?: number
}) => {
    return (
        <div className="grid grid-cols-2 items-center gap-4">
            <Label className="text-sm">{label}</Label>
            <div className="flex items-center gap-2">
                <Input
                    type="range"
                    className="p-0 h-2 cursor-pointer"
                    value={value ?? 0}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    min={min}
                    max={max}
                    step={step}
                />
                <span className="text-xs w-8 text-right font-mono">{value?.toFixed(2)}</span>
            </div>
        </div>
    );
};

export default function PropertiesPanel() {
  const { selectedObjectIds, objects, setObjectPosition, setObjectRotation, setObjectScale, updateObjectColor, updateObjectProperties, updateObjectMaterial, recordInteraction } = useCadStore(state => ({
    selectedObjectIds: state.selectedObjectIds,
    objects: state.objects,
    setObjectPosition: state.setObjectPosition,
    setObjectRotation: state.setObjectRotation,
    setObjectScale: state.setObjectScale,
    updateObjectColor: state.updateObjectColor,
    updateObjectMaterial: state.updateObjectMaterial,
    updateObjectProperties: state.updateObjectProperties,
    recordInteraction: state.recordInteraction,
  }), shallow);
  
  const isSingleSelection = selectedObjectIds.length === 1;
  const selectedObject = isSingleSelection ? objects[selectedObjectIds[0]] : null;

  if (selectedObjectIds.length > 1) {
    return <p className="p-4 text-sm text-muted-foreground">Multiple objects selected ({selectedObjectIds.length}).</p>;
  }

  if (!selectedObject) {
    return <p className="p-4 text-sm text-muted-foreground">No object selected.</p>;
  }
  
  const handlePositionChange = (value: [number, number, number]) => {
      recordInteraction();
      setObjectPosition(selectedObject.id, value);
  };
  const handleRotationChange = (value: [number, number, number]) => {
      recordInteraction();
      const radians = value.map(deg => THREE.MathUtils.degToRad(deg)) as [number, number, number];
      setObjectRotation(selectedObject.id, radians);
  };
  const handleScaleChange = (value: [number, number, number]) => {
      recordInteraction();
      const newScale: [number, number, number] = value.map(v => v === 0 ? 0.001 : v) as [number, number, number];
      setObjectScale(selectedObject.id, newScale);
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      recordInteraction();
      updateObjectColor(selectedObject.id, e.target.value);
  }
  
  const handlePropertyChange = (key: keyof ShapeProperties, value: number) => {
    recordInteraction();
    updateObjectProperties(selectedObject.id, { [key]: value });
  }

  const handleMaterialChange = (key: 'metalness' | 'roughness', value: number) => {
    recordInteraction();
    updateObjectMaterial(selectedObject.id, key, value);
  }

  const rotationInDegrees = selectedObject.transform.rotation.map(rad => THREE.MathUtils.radToDeg(rad)) as [number, number, number];
  
  const ShapePropertiesEditor = () => {
    if (!selectedObject.properties) return null;
    const { type, properties } = selectedObject;

    switch (type) {
        case 'box':
            return (
                <div className="space-y-2">
                    <PropertyInput label="Width" value={properties.width!} onChange={(v) => handlePropertyChange('width', v)} min={0.01} />
                    <PropertyInput label="Height" value={properties.height!} onChange={(v) => handlePropertyChange('height', v)} min={0.01} />
                    <PropertyInput label="Depth" value={properties.depth!} onChange={(v) => handlePropertyChange('depth', v)} min={0.01} />
                </div>
            );
        case 'sphere':
             return (
                <div className="space-y-2">
                    <PropertyInput label="Radius" value={properties.radius!} onChange={(v) => handlePropertyChange('radius', v)} min={0.01} />
                    <PropertyInput label="Width Segments" value={properties.widthSegments!} onChange={(v) => handlePropertyChange('widthSegments', v)} min={3} isInt />
                    <PropertyInput label="Height Segments" value={properties.heightSegments!} onChange={(v) => handlePropertyChange('heightSegments', v)} min={2} isInt />
                </div>
            );
        case 'cylinder':
            return (
                <div className="space-y-2">
                    <PropertyInput label="Radius Top" value={properties.radiusTop!} onChange={(v) => handlePropertyChange('radiusTop', v)} min={0} />
                    <PropertyInput label="Radius Bottom" value={properties.radiusBottom!} onChange={(v) => handlePropertyChange('radiusBottom', v)} min={0} />
                    <PropertyInput label="Height" value={properties.height!} onChange={(v) => handlePropertyChange('height', v)} min={0.01} />
                    <PropertyInput label="Segments" value={properties.radialSegments!} onChange={(v) => handlePropertyChange('radialSegments', v)} min={3} isInt/>
                </div>
            );
        case 'gear':
            return (
                <div className="space-y-2">
                    <PropertyInput label="Radius" value={properties.radius!} onChange={(v) => handlePropertyChange('radius', v)} min={0.1} />
                    <PropertyInput label="Height" value={properties.height!} onChange={(v) => handlePropertyChange('height', v)} min={0.01} />
                    <PropertyInput label="Teeth" value={properties.teeth!} onChange={(v) => handlePropertyChange('teeth', v)} min={3} isInt />
                </div>
            );
        case 'group':
             return <p className="text-sm text-muted-foreground">This is a group container. Transform the group or ungroup to edit individual objects.</p>
        default:
            return <p className="text-sm text-muted-foreground">No editable properties for this shape.</p>;
    }
  }

  return (
    <div className="p-4 h-full overflow-y-auto space-y-6">
      <h3 className="text-lg font-medium">Properties</h3>
      
      <div className="space-y-4">
        <Vector3Input label="Position" value={selectedObject.transform.position} onChange={handlePositionChange} />
        <Vector3Input label="Rotation (Degrees)" value={rotationInDegrees} onChange={handleRotationChange} />
        <Vector3Input label="Scale" value={selectedObject.transform.scale} onChange={handleScaleChange} step={0.01} />
      </div>

      { selectedObject.type !== 'group' && (
        <>
          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium text-base">Material</h4>
            <div className="space-y-1">
              <Label>Color</Label>
              <Input type="color" className="p-1 h-10 w-full" value={selectedObject.color} onChange={handleColorChange}/>
            </div>
            <SliderInput label="Metalness" value={selectedObject.metalness} onChange={(v) => handleMaterialChange('metalness', v)} />
            <SliderInput label="Roughness" value={selectedObject.roughness} onChange={(v) => handleMaterialChange('roughness', v)} />
          </div>

          <div className="space-y-2 border-t pt-4">
            <h4 className="font-medium text-base">Shape</h4>
            <ShapePropertiesEditor />
          </div>
        </>
      )}

      { selectedObject.type === 'group' && (
         <div className="border-t pt-4">
           <ShapePropertiesEditor />
         </div>
      )}
    </div>
  );
}