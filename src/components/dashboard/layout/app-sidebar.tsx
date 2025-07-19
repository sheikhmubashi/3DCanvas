"use client";
import {
 Home,
 GraduationCap,
 Palette,
 BookOpen,
 Trophy,
 User,
 HelpCircle,
 ChevronLeft,
 ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
 Sidebar,
 SidebarContent,
 SidebarHeader,
 SidebarMenu,
 SidebarMenuButton,
 SidebarMenuItem,
 SidebarFooter,
 useSidebar,
} from "@/components/ui/sidebar";

const sidebarItems = [
 { title: "Home", icon: Home, isActive: true },
 { title: "Classes", icon: GraduationCap },
 { title: "Designs", icon: Palette },
 { title: "Collections", icon: BookOpen },
 { title: "Tutorials", icon: BookOpen },
 { title: "Challenges", icon: Trophy },
];

export function AppSidebar() {
 const { toggleSidebar, state } = useSidebar();

 return (
  <Sidebar
   collapsible="icon"
   className="border-r border-gray-200 !bg-white max-h-[90vh] sticky top-0"
  >
   <SidebarHeader className="p-4 border-b border-gray-100 group-data-[collapsible=icon]:p-2">
    <div className="flex items-center gap-3 flex-col">
     <Avatar className="h-20 w-20">
      <AvatarImage src="/placeholder.svg?height=48&width=48" />
      <AvatarFallback className="bg-purple-500 text-white">
       <User className="h-6 w-6" />
      </AvatarFallback>
     </Avatar>
     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
      <span className="md:text-base text-sm font-semibold text-gray-900">
       Hammad Shaikh
      </span>
     </div>
    </div>
   </SidebarHeader>

   <SidebarContent className="px-2 py-4 group-data-[collapsible=icon]:px-2">
    <SidebarMenu className="space-y-2">
     {sidebarItems.map((item) => (
      <SidebarMenuItem key={item.title}>
       <SidebarMenuButton
        asChild
        isActive={item.isActive}
        tooltip={item.title}
        className="w-full justify-start gap-3 px-4 py-3 text-sm md:text-base font-medium text-black/80 rounded-full mx-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:mx-4"
       >
        <a href="#" className="flex items-center gap-3">
         <item.icon className="!h-6 !w-6" />
         <span>{item.title}</span>
        </a>
       </SidebarMenuButton>
      </SidebarMenuItem>
     ))}
    </SidebarMenu>
   </SidebarContent>

   <SidebarFooter className="p-4 border-t border-gray-100">
    <SidebarMenu>
     <SidebarMenuItem>
      <SidebarMenuButton
       asChild
       tooltip="Help center"
       className="w-full justify-start gap-3 px-4 py-3 text-sm font-medium"
      >
       <a href="#" className="flex items-center gap-3 text-gray-600">
        <HelpCircle className="h-5 w-5" />
        <span>Help center...</span>
       </a>
      </SidebarMenuButton>
     </SidebarMenuItem>

     {/* Collapse/Expand Button */}
     <SidebarMenuItem className="absolute right-0 top-1/2 mt-2 -me-3 bg-white rounded-2xl">
      <Button
       onClick={toggleSidebar}
       variant="ghost"
       size="icon"
       className="w-full h-8 border py-8 px-1 rounded-2xl  hover:bg-gray-100 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:mx-auto"
       title={state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
      >
       {state === "collapsed" ? (
        <ChevronRight className="h-4 w-4" />
       ) : (
        <ChevronLeft className="h-4 w-4" />
       )}
       <span className="sr-only">
        {state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
       </span>
      </Button>
     </SidebarMenuItem>
    </SidebarMenu>
   </SidebarFooter>
  </Sidebar>
 );
}
