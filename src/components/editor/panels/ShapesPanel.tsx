// src/components/editor/sidebar/ShapesPanel.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCadStore, ShapeType } from "@/store/useCadStore";

type ShapeInfo = {
  type: ShapeType;
  image: string;
  label: string;
};

const ShapeButton = ({ type, image, label }: ShapeInfo) => {
  const setPendingShape = useCadStore((state) => state.setPendingShape);

  const handlePointerDown = () => {
    setPendingShape(type);
  };

  return (
    <Button
      variant="outline"
      className="h-24 w-full flex-col gap-1 border-none rounded bg-[#f6f7f9] cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      draggable={false} // ✅ Prevent native drag image
      onDragStart={(e) => e.preventDefault()} // ✅ Fallback prevention
    >
      <img
        src={image}
        alt={label}
        className="h-12 w-12 object-contain"
        draggable={false} // ✅ Prevent drag ghost image
      />
      <span className="text-xs">{label}</span>
    </Button>
  );
};

export default function ShapesPanel() {
  const [searchTerm, setSearchTerm] = useState("");

  const allShapes: ShapeInfo[] = [
    { type: "box", image: "/shapes/shape-box.png", label: "Box" },
    { type: "sphere", image: "/shapes/shape-sphere.png", label: "Sphere" },
    { type: "cone", image: "/shapes/shape-cone.png", label: "Cone" },
    { type: "pyramid", image: "/shapes/shape-pyramid.png", label: "Pyramid" },
    { type: "torus", image: "/shapes/shape-torus.png", label: "Torus" },
    { type: "gear", image: "/shapes/shape-gear.png", label: "Gear" },
  ];

  const filteredShapes = allShapes.filter((shape) =>
    shape.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <Input
        type="text"
        placeholder="Search shapes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full bg-[#f6f7f9]"
      />
      <div className="grid grid-cols-2 gap-2">
        {filteredShapes.map((shape) => (
          <ShapeButton key={shape.type} {...shape} />
        ))}
      </div>
    </div>
  );
}
