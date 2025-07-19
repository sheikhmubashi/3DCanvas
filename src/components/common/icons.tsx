interface PlusIconProps {
 className?: string;
 color?: "blue" | "green" | "purple";
}

const colorClasses = {
 blue: "text-blue-500",
 green: "text-green-500",
 purple: "text-purple-500",
};

export function PlusIcon({
 className = "h-6 w-6 mx-auto mb-2",
 color = "purple",
}: PlusIconProps) {
 return (
  <svg
   className={`${className} ${colorClasses[color]}`}
   fill="none"
   stroke="currentColor"
   viewBox="0 0 24 24"
   aria-hidden="true"
  >
   <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M12 4v16m8-8H4"
   />
  </svg>
 );
}
