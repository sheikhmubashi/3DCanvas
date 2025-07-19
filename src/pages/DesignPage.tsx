// src/pages/DesignPage.tsx

import EditorHeader from "@/components/editor/layout/EditorHeader";
import SubHeader from "@/components/editor/layout/SubHeader";
import RightPanel from "@/components/editor/layout/RightPanel";
import CanvasContainer from "@/components/editor/canvas/CanvasContainer";
import CanvasOverlay from "@/components/editor/layout/CanvasOverlay";
import FloatingPropertiesPanel from "@/components/editor/layout/FloatingPropertiesPanel";
import { useCadStore } from "@/store/useCadStore";

export default function DesignPage() {
  const selectedObjectIds = useCadStore(state => state.selectedObjectIds);
  const hasSelection = selectedObjectIds.length > 0;

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      <EditorHeader />
      <SubHeader />
      <main className="flex flex-1 overflow-hidden">
        {/* LeftToolbar has been REMOVED as requested */}
        <div className="flex-1 relative">
          <CanvasContainer />
          <CanvasOverlay />
          {hasSelection && <FloatingPropertiesPanel />}
        </div>
        <div className="w-64 flex-shrink-0 border-l bg-muted">
          <RightPanel />
        </div>
      </main>
    </div>
  );
}