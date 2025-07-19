// src/components/editor/layout/SubHeader.tsx

import { Button } from "@/components/ui/button";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { useCadStore } from "@/store/useCadStore";
import { shallow } from "zustand/shallow";
import {
 Copy,
 ClipboardPaste,
 CopyPlus,
 Trash2,
 Undo2,
 Redo2,
 FlipHorizontal,
 Camera,
 Group,
 Ungroup,
} from "lucide-react";

// === MODIFIED: Icons are now larger ===
const SubHeaderIcon = ({
 icon: Icon,
 label,
 onClick,
 disabled = false,
}: {
 icon: React.ElementType;
 label: string;
 onClick?: () => void;
 disabled?: boolean;
}) => (
 <Tooltip>
  <TooltipTrigger asChild>
   {/* The button is larger, and the icon inside is also larger */}
   <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    disabled={disabled}
    className="h-10 w-10 !text-[#c5cfd9]"
   >
    <Icon className="!h-6 !w-6 !text-[#000000]" />
   </Button>
  </TooltipTrigger>
  <TooltipContent>
   <p>{label}</p>
  </TooltipContent>
 </Tooltip>
);

export default function SubHeader() {
 const {
  undo,
  redo,
  copySelectedObjects,
  pasteObjects,
  deleteSelectedObjects,
  duplicateSelectedObjects,
  mirrorSelectedObjects,
  groupSelectedObjects,
  ungroupObjects,
  exportProject,
  loadProject,
  triggerScreenshot,
  selectedObjectIds,
  objects,
  clipboard,
 } = useCadStore(
  (state) => ({
   undo: state.undo,
   redo: state.redo,
   copySelectedObjects: state.copySelectedObjects,
   pasteObjects: state.pasteObjects,
   deleteSelectedObjects: state.deleteSelectedObjects,
   duplicateSelectedObjects: state.duplicateSelectedObjects,
   mirrorSelectedObjects: state.mirrorSelectedObjects,
   groupSelectedObjects: state.groupSelectedObjects,
   ungroupObjects: state.ungroupObjects,
   exportProject: state.exportProject,
   loadProject: state.loadProject,
   triggerScreenshot: state.triggerScreenshot,
   selectedObjectIds: state.selectedObjectIds,
   objects: state.objects,
   clipboard: state.clipboard,
  }),
  shallow
 );

 const hasSelection = selectedObjectIds.length > 0;
 const canGroup = selectedObjectIds.length >= 2;
 const canUngroup =
  hasSelection && selectedObjectIds.some((id) => objects[id]?.type === "group");

 const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (file) {
   const reader = new FileReader();
   reader.onload = (e) => {
    if (typeof e.target?.result === "string") loadProject(e.target.result);
   };
   reader.readAsText(file);
  }
 };
 const triggerImport = () =>
  document.getElementById("file-import-input")?.click();

 return (
  <div className="h-14 px-4 flex items-center justify-between border-b !bg-[#f1f1f3]  shrink-0">
   <TooltipProvider delayDuration={100}>
    <div className="flex items-center gap-4">
     <SubHeaderIcon
      icon={Copy}
      label="Copy (Ctrl+C)"
      onClick={copySelectedObjects}
      disabled={!hasSelection}
     />
     <SubHeaderIcon
      icon={ClipboardPaste}
      label="Paste (Ctrl+V)"
      onClick={pasteObjects}
      disabled={!clipboard}
     />
     <SubHeaderIcon
      icon={CopyPlus}
      label="Duplicate"
      onClick={duplicateSelectedObjects}
      disabled={!hasSelection}
     />
     <SubHeaderIcon
      icon={Trash2}
      label="Delete (Del)"
      onClick={deleteSelectedObjects}
      disabled={!hasSelection}
     />
     <Separator orientation="vertical" className="h-8 mx-2" />
     <SubHeaderIcon icon={Undo2} label="Undo (Ctrl+Z)" onClick={undo} />
     <SubHeaderIcon icon={Redo2} label="Redo (Ctrl+Y)" onClick={redo} />
    </div>
    <div className="flex items-center gap-2">
     <SubHeaderIcon
      icon={FlipHorizontal}
      label="Mirror"
      onClick={mirrorSelectedObjects}
      disabled={!hasSelection}
     />
     <SubHeaderIcon
      icon={Group}
      label="Group (Ctrl+G)"
      onClick={groupSelectedObjects}
      disabled={!canGroup}
     />
     <SubHeaderIcon
      icon={Ungroup}
      label="Ungroup (Ctrl+Shift+G)"
      onClick={ungroupObjects}
      disabled={!canUngroup}
     />
     <Separator orientation="vertical" className="h-8 mx-2" />

     {/* === MODIFIED: Replaced icons with text buttons === */}
     <Tooltip>
      <TooltipTrigger asChild>
       <Button
        variant="outline"
        className="bg-transparent"
        onClick={triggerImport}
       >
        Import
       </Button>
      </TooltipTrigger>
      <TooltipContent>
       <p>Import Project (.json)</p>
      </TooltipContent>
     </Tooltip>

     <Tooltip>
      <TooltipTrigger asChild>
       <Button
        variant="outline"
        className="bg-transparent"
        onClick={exportProject}
       >
        Export
       </Button>
      </TooltipTrigger>
      <TooltipContent>
       <p>Export Project (.json)</p>
      </TooltipContent>
     </Tooltip>

     <SubHeaderIcon
      icon={Camera}
      label="Screenshot"
      onClick={triggerScreenshot}
     />
     <input
      type="file"
      id="file-import-input"
      accept=".json"
      onChange={handleFileImport}
      className="hidden"
     />
    </div>
   </TooltipProvider>
  </div>
 );
}
