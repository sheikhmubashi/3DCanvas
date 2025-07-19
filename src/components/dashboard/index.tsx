"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/layout/app-sidebar";
import { TopNavigation } from "@/components/dashboard/layout/top-navigation";
import { Footer } from "@/components/dashboard/layout/footer";

import { HeroSection } from "@/components/dashboard/sections/hero-section";
import { DesignsSection } from "@/components/dashboard/sections/designs-section";
import { CircuitsSection } from "@/components/dashboard/sections/circuits-section";
import { FullScreenDropdown } from "../ui/full-screen-dropdown";
import { CodeblocksSection } from "./sections/codeblocks-section";
import { Link } from "react-router-dom";

export function Dashboard() {
 const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

 const handleTinkerClick = () => {
  setActiveDropdown(activeDropdown === "tinker" ? null : "tinker");
 };

 return (
  <>
   <TopNavigation onTinkerClick={handleTinkerClick} />

   <SidebarProvider>
    <div className="flex min-h-screen w-full">
     <AppSidebar />
     <div className="flex-1 flex flex-col">
      <SidebarInset className="flex-1">
       {/* Full Screen Dropdown */}
       <FullScreenDropdown
        isOpen={activeDropdown === "tinker"}
        onClose={() => setActiveDropdown(null)}
        title="Tinker"
       />

       {/* Main Content */}
       <main className="flex-1 bg-[#f1f1f1]">
        <div className="container mx-auto px-6 py-8">
         <div className="mb-20">
          <HeroSection />
         </div>
         <DesignsSection />
         <CircuitsSection />
         <CodeblocksSection />
        </div>

        {/* Floating Create Button */}
        <Link to={"/3d-design"}>
         <Button className="fixed bottom-6 right-6 text-white rounded-full px-6 py-3 shadow-lg z-50 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create
         </Button>
        </Link>
       </main>
      </SidebarInset>
     </div>
    </div>
   </SidebarProvider>
   {/* Footer outside SidebarInset but inside SidebarProvider */}
   <Footer />
  </>
 );
}
