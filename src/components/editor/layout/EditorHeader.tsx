// src/components/editor/layout/EditorHeader.tsx

import { Button } from "@/components/ui/button";
import {
 Tooltip,
 TooltipContent,
 TooltipProvider,
 TooltipTrigger,
} from "@/components/ui/tooltip";
import {
 Cuboid,
 Feather,
 Hammer,
 Puzzle,
 Share2,
 UserCircle,
 FileJson,
} from "lucide-react";

const HeaderIcon = ({
 icon: Icon,
 label,
}: {
 icon: React.ElementType;
 label: string;
}) => (
 <Tooltip>
  <TooltipTrigger asChild>
   <Button variant="ghost" size="icon">
    <Icon className="!h-5 !w-5" />
   </Button>
  </TooltipTrigger>
  <TooltipContent className="z-50">
   <p>{label}</p>
  </TooltipContent>
 </Tooltip>
);

export default function EditorHeader() {
 return (
  <header className="h-16 px-4 flex items-center justify-between border-b bg-background z-20 shrink-0">
   <TooltipProvider delayDuration={100}>
    <div className="flex items-center gap-3">
     <FileJson className="h-8 w-8 text-primary" />
     <h1 className="text-xl font-bold tracking-tight">FiberCAD</h1>
    </div>
    <div className="flex items-center gap-2">
     <HeaderIcon icon={Cuboid} label="3D Design (Current)" />
     <HeaderIcon icon={Feather} label="Gravity Mode (Coming Soon)" />
     <HeaderIcon icon={Hammer} label="Block Mode (Coming Soon)" />
     <HeaderIcon icon={Puzzle} label="Roblox Mode (Coming Soon)" />
     <HeaderIcon icon={Share2} label="Share" />
     <HeaderIcon icon={UserCircle} label="Account" />
    </div>
   </TooltipProvider>
  </header>
 );
}
