"use client";
import { Link } from "react-router-dom";
import { Search, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotFound() {
 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center p-4">
   <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
    <div className="mb-6">
     <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
      <Search className="w-8 h-8 text-purple-600" />
     </div>
     <h1 className="text-6xl font-artifakt-bold text-purple-600 mb-2">404</h1>
     <h2 className="text-2xl font-artifakt-bold text-gray-900 mb-2">
      Page Not Found
     </h2>
     <p className="text-gray-600 mb-6">
      The page you're looking for doesn't exist or has been moved.
     </p>
    </div>

    <div className="space-y-3">
     <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
      <Link to="/">
       <Home className="w-4 h-4 mr-2" />
       Go Home
      </Link>
     </Button>

     <Button
      asChild
      variant="outline"
      className="w-full bg-transparent"
      onClick={() => window.history.back()}
     >
      <button>
       <ArrowLeft className="w-4 h-4 mr-2" />
       Go Back
      </button>
     </Button>
    </div>

    <div className="mt-8 pt-6 border-t border-gray-200">
     <p className="text-sm text-gray-500 mb-3">Popular pages:</p>
     <div className="flex flex-wrap gap-2 justify-center">
      <Link
       to="/3d-design"
       className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
      >
       3D Design
      </Link>
      <Link
       to="/circuits"
       className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
      >
       Circuits
      </Link>
      <Link
       to="/tutorials"
       className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
      >
       Tutorials
      </Link>
     </div>
    </div>
   </div>
  </div>
 );
}
