"use client";
import { motion, AnimatePresence } from "framer-motion";

// Icons
const BoxIcon = () => (
 <svg
  className="w-12 h-12"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <path
   strokeLinecap="round"
   strokeLinejoin="round"
   strokeWidth={2}
   d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
  />
 </svg>
);

const ZapIcon = () => (
 <svg
  className="w-12 h-12"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <polygon points="13,2 3,14 12,14 11,22 21,10 12,10 13,2" />
 </svg>
);

const CodeIcon = () => (
 <svg
  className="w-12 h-12"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <polyline points="16,18 22,12 16,6" />
  <polyline points="8,6 2,12 8,18" />
 </svg>
);

const PlayIcon = () => (
 <svg
  className="w-12 h-12"
  fill="none"
  stroke="currentColor"
  viewBox="0 0 24 24"
 >
  <polygon points="5,3 19,12 5,21 5,3" />
 </svg>
);

const TabletIcon = () => (
 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
  <line x1="12" y1="18" x2="12.01" y2="18" />
 </svg>
);

const tinkerDropdownItems = [
 {
  title: "3D Design",
  description: "Start designing in 3D in minutes.",
  icon: BoxIcon,
  color: "text-blue-500",
 },
 {
  title: "Circuits",
  description: "Add light and movement to your designs.",
  icon: ZapIcon,
  color: "text-green-500",
 },
 {
  title: "Codeblocks",
  description: "Write programs to bring your designs to life.",
  icon: CodeIcon,
  color: "text-purple-500",
 },
 {
  title: "Sim Lab",
  description: "Get things moving.",
  icon: PlayIcon,
  color: "text-blue-400",
 },
];

const tinkerApps = [
 {
  title: "iPad App",
  description: "Design on the go.",
  icon: TabletIcon,
  color: "text-blue-500",
 },
 {
  title: "Autodesk Fusion",
  description: "Level up your designs.",
  icon: "F",
  color: "text-orange-500",
 },
 {
  title: "Autodesk Forma",
  description: "Build your future now.",
  icon: "A",
  color: "text-black",
 },
];

interface FullScreenDropdownProps {
 isOpen: boolean;
 onClose: () => void;
 title: string;
}

export function FullScreenDropdown({
 isOpen,
 onClose,
 title,
}: FullScreenDropdownProps) {
 return (
  <AnimatePresence>
   {isOpen && (
    <>
     {/* Animated Backdrop */}
     <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-40"
      onClick={onClose}
     />

     {/* Animated Dropdown Content */}
     <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-16 left-0 right-0 bg-white z-50 shadow-lg border-b font-artifakt"
     >
      <div className="max-w-7xl mx-auto px-6 py-8">
       {/* Main Items Grid with Stagger Animation */}
       <motion.div
        initial="hidden"
        animate="visible"
        variants={{
         hidden: { opacity: 0 },
         visible: {
          opacity: 1,
          transition: {
           staggerChildren: 0.1,
          },
         },
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8"
       >
        {tinkerDropdownItems.map((item, index) => {
         const IconComponent = item.icon;
         return (
          <motion.div
           key={index}
           variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
           }}
           whileHover={{ scale: 1.05 }}
           whileTap={{ scale: 0.95 }}
           className="text-center group cursor-pointer"
          >
           <motion.div
            whileHover={{ rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-20 h-20 mx-auto mb-4 flex items-center justify-center"
           >
            <div className={item.color}>
             <IconComponent />
            </div>
           </motion.div>
           <h3 className="text-xl font-artifakt-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
            {item.title}
           </h3>
           <p className="text-gray-600 text-sm font-medium">
            {item.description}
           </p>
          </motion.div>
         );
        })}
       </motion.div>

       {/* Apps Section with Stagger Animation */}
       <motion.div
        initial="hidden"
        animate="visible"
        variants={{
         hidden: { opacity: 0 },
         visible: {
          opacity: 1,
          transition: {
           staggerChildren: 0.1,
           delayChildren: 0.2,
          },
         },
        }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
       >
        {tinkerApps.map((app, index) => (
         <motion.div
          key={index}
          variants={{
           hidden: { opacity: 0, x: -20 },
           visible: { opacity: 1, x: 0 },
          }}
          whileHover={{ scale: 1.02, x: 5 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
         >
          <motion.div
           whileHover={{ rotate: 10 }}
           className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-lg"
          >
           {typeof app.icon === "string" ? (
            <span className={`text-xl font-bold ${app.color}`}>{app.icon}</span>
           ) : (
            <div className={app.color}>
             <app.icon />
            </div>
           )}
          </motion.div>
          <div>
           <h4 className="font-artifakt-bold text-gray-900">{app.title}</h4>
           <p className="text-sm text-gray-600 font-medium">
            {app.description}
           </p>
          </div>
         </motion.div>
        ))}
       </motion.div>
      </div>
     </motion.div>
    </>
   )}
  </AnimatePresence>
 );
}
