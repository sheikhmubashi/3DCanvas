// src/components/editor/layout/RightPanel.tsx

import ShapesPanel from "@/components/editor/panels/ShapesPanel";

export default function RightPanel() {
 return (
  <aside className="w-full h-full p-4 overflow-y-auto bg-[#f1f1f3]">
   <h2 className="text-lg font-semibold mb-4">Shapes</h2>
   <ShapesPanel />
  </aside>
 );
}
