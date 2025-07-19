"use client";
import { useRouteError, Link } from "react-router-dom";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorPage() {
 const error = useRouteError() as any;

 return (
  <div className="min-h-screen bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center p-4">
   <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
    <div className="mb-6">
     <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
      <AlertTriangle className="w-8 h-8 text-red-600" />
     </div>
     <h1 className="text-2xl font-artifakt-bold text-gray-900 mb-2">
      Oops! Something went wrong
     </h1>
     <p className="text-gray-600 mb-4">
      {error?.statusText || error?.message || "An unexpected error occurred"}
     </p>
    </div>

    <div className="space-y-3">
     <Button
      onClick={() => window.location.reload()}
      className="w-full bg-purple-600 hover:bg-purple-700"
     >
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
     </Button>

     <Button asChild variant="outline" className="w-full bg-transparent">
      <Link to="/">
       <Home className="w-4 h-4 mr-2" />
       Go Home
      </Link>
     </Button>
    </div>

    {process.env.NODE_ENV === "development" && (
     <details className="mt-6 text-left">
      <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
       Error Details (Development)
      </summary>
      <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
       {error?.stack || JSON.stringify(error, null, 2)}
      </pre>
     </details>
    )}
   </div>
  </div>
 );
}
