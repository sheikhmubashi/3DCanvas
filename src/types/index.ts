export interface Shape {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone';
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

export interface ShapeTemplate {
  id: string;
  type: 'cube' | 'sphere' | 'cylinder' | 'cone';
  name: string;
  icon: string;
  defaultScale: [number, number, number];
}