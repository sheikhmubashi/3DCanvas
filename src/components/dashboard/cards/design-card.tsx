"use client";
import type React from "react";

const PlusIcon = () => (
 <svg
  className="h-6 w-6 text-purple-500 mx-auto mb-2"
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

interface DesignCardProps {
 title: string;
 thumbnail?: string;
 subtitle?: string;
 isCreate?: boolean;
}

export function DesignCard({
 title,
 thumbnail,
 subtitle,
 isCreate,
}: DesignCardProps) {
 const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>
 ) => {
  e.currentTarget.src = "/placeholder.svg?height=120&width=180";
 };

 return (
  <div className="bg-white rounded-xl border-2 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group">
   {isCreate ? (
    <div className="aspect-[3/2] flex items-center justify-center bg-purple-50/50 rounded-lg border-2 border-dashed ">
     <div className="text-center">
      <PlusIcon />
      <p className="text-xs font-bold text-purple-600 px-2">{title}</p>
     </div>
    </div>
   ) : (
    <>
     <div className="aspect-[3/2] bg-gray-200 rounded-t-lg overflow-hidden">
      <img
       src={thumbnail || "/placeholder.svg?height=120&width=180"}
       alt={title}
       className="w-full h-full object-cover group-hover:scale-105 transition-transform"
       loading="lazy"
       decoding="async"
       onError={handleImageError}
      />
     </div>
     <div className="p-3">
      <h3 className="font-artifakt-bold text-gray-900 text-sm">{title}</h3>
      {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
     </div>
    </>
   )}
  </div>
 );
}
