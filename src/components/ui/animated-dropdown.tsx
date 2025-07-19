"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DropdownItem {
 title: string;
 href: string;
}

interface AnimatedDropdownProps {
 title: string;
 items: DropdownItem[];
 className?: string;
}

export function AnimatedDropdown({
 title,
 items,
 className,
}: AnimatedDropdownProps) {
 const [isOpen, setIsOpen] = useState(false);

 return (
  <div className="relative">
   <Button
    variant="ghost"
    className={`text-white hover:bg-purple-700 hover:text-white rounded md:text-base gap-1 px-3 py-2 font-artifakt font-semibold ${className}`}
    onClick={() => setIsOpen(!isOpen)}
    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
   >
    {title}
    <motion.div
     animate={{ rotate: isOpen ? 180 : 0 }}
     transition={{ duration: 0.2 }}
    >
     <ChevronDown className="h-3 w-3" />
    </motion.div>
   </Button>

   <AnimatePresence>
    {isOpen && (
     <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50 font-artifakt"
     >
      {items.map((item, index) => (
       <motion.div
        key={item.title}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
       >
        <motion.a
         href={item.href}
         whileHover={{ backgroundColor: "#f3f4f6", x: 5 }}
         className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-medium transition-colors"
        >
         {item.title}
        </motion.a>
       </motion.div>
      ))}
     </motion.div>
    )}
   </AnimatePresence>
  </div>
 );
}
