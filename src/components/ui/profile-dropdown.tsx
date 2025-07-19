"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
 User,
 Plus,
 Grid3X3,
 Bell,
 Settings,
 GraduationCap,
 LogOut,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const profileMenuItems = [
 {
  title: "New Design",
  icon: Plus,
  href: "#",
 },
 {
  title: "My Designs",
  icon: Grid3X3,
  href: "#",
 },
 {
  title: "Notifications",
  icon: Bell,
  href: "#",
 },
 {
  title: "Settings",
  icon: Settings,
  href: "#",
 },
 {
  title: "My Classes",
  icon: GraduationCap,
  href: "#",
 },
];

export function ProfileDropdown() {
 const [isOpen, setIsOpen] = useState(false);

 return (
  <div className="relative">
   <Button
    variant="ghost"
    size="icon"
    className="text-white hover:bg-purple-700 rounded-full transition-colors"
    onClick={() => setIsOpen(!isOpen)}
    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
   >
    <Avatar className="h-8 w-8">
     <AvatarImage src="/placeholder.svg?height=32&width=32" />
     <AvatarFallback className="bg-purple-800 text-white text-xs">
      <User className="h-4 w-4" />
     </AvatarFallback>
    </Avatar>
   </Button>

   <AnimatePresence>
    {isOpen && (
     <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 font-artifakt"
     >
      {/* User Profile Header */}
      <motion.div
       initial={{ opacity: 0, y: -5 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ delay: 0.1 }}
       className="flex items-center gap-3 p-3 border-b border-gray-100 mb-2"
      >
       <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg?height=40&width=40" />
        <AvatarFallback className="bg-gray-200">
         <User className="h-5 w-5 text-gray-600" />
        </AvatarFallback>
       </Avatar>
       <span className="font-artifakt-bold text-gray-900">Hammad Shaikh</span>
      </motion.div>

      {/* Menu Items */}
      {profileMenuItems.map((item, index) => (
       <motion.div
        key={item.title}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 + 0.1 }}
       >
        <motion.a
         href={item.href}
         whileHover={{ backgroundColor: "#f3f4f6", x: 5 }}
         className="flex items-center gap-3 w-full p-3 text-gray-700 hover:bg-gray-50 transition-colors"
        >
         <item.icon className="h-4 w-4 text-gray-600" />
         <span className="font-medium">{item.title}</span>
        </motion.a>
       </motion.div>
      ))}

      <div className="border-t border-gray-100 my-2" />

      {/* Log Out */}
      <motion.div
       initial={{ opacity: 0, x: -10 }}
       animate={{ opacity: 1, x: 0 }}
       transition={{ delay: 0.4 }}
      >
       <motion.button
        whileHover={{ backgroundColor: "#fef2f2", x: 5 }}
        className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 transition-colors"
       >
        <LogOut className="h-4 w-4" />
        <span className="font-medium">Log Out</span>
       </motion.button>
      </motion.div>
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 );
}
