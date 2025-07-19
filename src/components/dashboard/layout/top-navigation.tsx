"use client";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedDropdown } from "@/components/ui/animated-dropdown";
import { ProfileDropdown } from "@/components/ui/profile-dropdown";

const teachersDropdownItems = [
 { title: "Classrooms", href: "#" },
 { title: "Projects", href: "#" },
 { title: "Challenges", href: "#" },
 { title: "Design & Make Skills", href: "#" },
 { title: "Privacy & Security", href: "#" },
];

const resourcesDropdownItems = [
 { title: "Blog", href: "#" },
 { title: "Help Center", href: "#" },
 { title: "Send us feedback", href: "#" },
 { title: "Learning Center", href: "#" },
 { title: "Tips & Tricks", href: "#" },
 { title: "Server Status", href: "#" },
];

interface TopNavigationProps {
 onTinkerClick: () => void;
}

export function TopNavigation({ onTinkerClick }: TopNavigationProps) {
 return (
  <header className="bg-purple-600 text-white sticky top-0 z-40 flex-1">
   <div className="flex h-16 md:h-20 items-center justify-between px-6">
    {/* Logo */}
    <div className="flex items-center gap-3">
     <div className="flex items-center gap-3">
      {/* 3D Cube Icon */}
      <div className="relative w-10 h-10">
       <div className="absolute inset-0 bg-white/20 rounded-lg transform rotate-12"></div>
       <div className="absolute inset-0 bg-white/40 rounded-lg transform -rotate-6"></div>
       <div className="absolute inset-0 bg-white rounded-lg flex items-center justify-center">
        <svg
         className="w-6 h-6 text-purple-600"
         fill="currentColor"
         viewBox="0 0 24 24"
        >
         <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 4.5L19.5 8.5 12 12.5 4.5 8.5 12 4.5zM4 10.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z" />
        </svg>
       </div>
      </div>
      <div className="flex flex-col font-artifakt">
       <span className="text-xs font-bold tracking-wider">DESIGN</span>
       <span className="text-lg font-artifakt-bold">CubeForge</span>
      </div>
     </div>
    </div>

    {/* Navigation Menu */}
    <nav className="hidden md:flex items-center gap-2 font-artifakt">
     <button
      className="flex items-center gap-1 px-3 py-2 text-white hover:bg-purple-700 rounded font-semibold transition-colors"
      onClick={onTinkerClick}
     >
      Tinker
      <ChevronDown className="h-3 w-3" />
     </button>
     <a
      href="#"
      className="px-3 py-2 text-white hover:bg-purple-700 rounded font-semibold transition-colors"
     >
      Gallery
     </a>
     <a
      href="#"
      className="px-3 py-2 text-white hover:bg-purple-700 rounded font-semibold transition-colors"
     >
      Projects
     </a>

     {/* Animated Teachers Dropdown */}
     <AnimatedDropdown title="Teachers" items={teachersDropdownItems} />

     {/* Animated Resources Dropdown */}
     <AnimatedDropdown title="Resources" items={resourcesDropdownItems} />
    </nav>

    {/* Right Side Actions */}
    <div className="flex items-center gap-3">
     <Button
      variant="ghost"
      size="icon"
      className="text-white hover:bg-purple-700 transition-colors"
     >
      <Search className="h-5 w-5" />
     </Button>
     <ProfileDropdown />
    </div>
   </div>
  </header>
 );
}
