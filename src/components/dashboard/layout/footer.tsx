"use client";
import { Link } from "react-router-dom";
import {
 Twitter,
 Instagram,
 Facebook,
 Youtube,
 ChevronDown,
} from "lucide-react";

export function Footer() {
 return (
  <footer className="bg-gray-50 border-t border-gray-200">
   <div className="max-w-6xl mx-auto px-6 py-12">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
     {/* Left Column - Description and Social */}
     <div className="md:col-span-1">
      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
       CubeForge is a free web app for 3D design, electronics, and coding. We're
       the ideal introduction to creative design and make technology.
      </p>
      <div>
       <h3 className="font-artifakt-bold mb-4 text-gray-900">Follow Us</h3>
       <div className="flex gap-4">
        <Link
         to="/social/twitter"
         className="text-gray-400 hover:text-purple-600 transition-colors"
        >
         <Twitter className="w-5 h-5" />
        </Link>
        <Link
         to="/social/instagram"
         className="text-gray-400 hover:text-purple-600 transition-colors"
        >
         <Instagram className="w-5 h-5" />
        </Link>
        <Link
         to="/social/facebook"
         className="text-gray-400 hover:text-purple-600 transition-colors"
        >
         <Facebook className="w-5 h-5" />
        </Link>
        <Link
         to="/social/youtube"
         className="text-gray-400 hover:text-purple-600 transition-colors"
        >
         <Youtube className="w-5 h-5" />
        </Link>
       </div>
      </div>
     </div>

     {/* Create Column */}
     <div>
      <h3 className="font-artifakt-bold mb-4 text-gray-900">Create</h3>
      <ul className="space-y-3 text-sm text-gray-600">
       <li>
        <Link
         to="/3d-design"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         3D Design
        </Link>
       </li>
       <li>
        <Link
         to="/circuits"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Circuits
        </Link>
       </li>
       <li>
        <Link
         to="/codeblocks"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Codeblocks
        </Link>
       </li>
       <li>
        <Link
         to="/mobile-app"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Mobile App
        </Link>
       </li>
       <li>
        <Link
         to="/sim-lab"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Sim Lab
        </Link>
       </li>
      </ul>
     </div>

     {/* Learn Column */}
     <div>
      <h3 className="font-artifakt-bold mb-4 text-gray-900">Learn</h3>
      <ul className="space-y-3 text-sm text-gray-600">
       <li>
        <Link
         to="/tutorials"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Tutorials
        </Link>
       </li>
       <li>
        <Link
         to="/projects"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Projects
        </Link>
       </li>
       <li>
        <Link
         to="/challenges"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Challenges
        </Link>
       </li>
       <li>
        <Link
         to="/design-skills"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Design Skills
        </Link>
       </li>
       <li>
        <Link
         to="/community"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Community
        </Link>
       </li>
      </ul>
     </div>

     {/* Support Column */}
     <div>
      <h3 className="font-artifakt-bold mb-4 text-gray-900">Support</h3>
      <ul className="space-y-3 text-sm text-gray-600">
       <li>
        <Link
         to="/blog"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Blog
        </Link>
       </li>
       <li>
        <Link
         to="/help"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Help Center
        </Link>
       </li>
       <li>
        <Link
         to="/feedback"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Send Feedback
        </Link>
       </li>
       <li>
        <Link
         to="/learning"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Learning Center
        </Link>
       </li>
       <li>
        <Link
         to="/tips"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Tips & Tricks
        </Link>
       </li>
       <li>
        <Link
         to="/status"
         className="hover:text-purple-600 transition-colors font-medium"
        >
         Server Status
        </Link>
       </li>
      </ul>
     </div>

     {/* Right Column - Brand and Tools */}
     <div className="flex flex-col items-end">
      {/* CubeForge Logo */}
      <div className="mb-6">
       <Link to="/" className="flex items-center gap-2">
        <div className="relative w-8 h-8">
         <div className="absolute inset-0 bg-purple-200 rounded-lg transform rotate-12"></div>
         <div className="absolute inset-0 bg-purple-400 rounded-lg transform -rotate-6"></div>
         <div className="absolute inset-0 bg-purple-600 rounded-lg flex items-center justify-center">
          <svg
           className="w-4 h-4 text-white"
           fill="currentColor"
           viewBox="0 0 24 24"
          >
           <path d="M12 2L2 7v10l10 5 10-5V7l-10-5zM12 4.5L19.5 8.5 12 12.5 4.5 8.5 12 4.5zM4 10.5l7 3.5v7l-7-3.5v-7zm16 0v7l-7 3.5v-7l7-3.5z" />
          </svg>
         </div>
        </div>
        <span className="text-xl font-artifakt-bold text-purple-600">
         CubeForge
        </span>
       </Link>
      </div>

      {/* Language Selector */}
      <div className="mb-4">
       <div className="relative">
        <select className="appearance-none bg-white border border-gray-300 rounded px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium">
         <option>English (Default)</option>
         <option>Español</option>
         <option>Français</option>
         <option>Deutsch</option>
         <option>中文</option>
         <option>日本語</option>
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
         <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
       </div>
      </div>

      {/* Privacy Link */}
      <div className="mb-4">
       <Link
        to="/privacy"
        className="text-sm text-gray-600 hover:text-purple-600 underline font-medium transition-colors"
       >
        Privacy & Security →
       </Link>
      </div>

      {/* Download Buttons */}
      <div className="flex flex-col gap-3">
       {/* App Store Badge */}
       <Link
        to="/download/ios"
        className="bg-black text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-gray-800 transition-colors"
       >
        <div className="flex items-center gap-2">
         <div className="text-left">
          <div className="text-xs">Download on the</div>
          <div className="text-sm font-bold">App Store</div>
         </div>
        </div>
       </Link>

       {/* Chrome Web Store Button */}
       <Link
        to="/download/chrome"
        className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50  transition-colors"
       >
        <div className="w-5 h-5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded-full flex items-center justify-center">
         <div className="w-3 h-3 bg-white rounded-full"></div>
        </div>
        <div className="text-left">
         <div className="text-xs text-gray-500">Add to</div>
         <div className="text-sm font-medium">Chrome</div>
        </div>
       </Link>
      </div>
     </div>
    </div>

    {/* Terms Section */}
    <div className="border-t border-gray-200 mt-8 pt-6">
     <p className="text-sm text-gray-600 mb-4 font-medium">
      Free use of CubeForge is subject to acceptance of and compliance with the{" "}
      <Link
       to="/terms"
       className="text-purple-600 hover:text-purple-700 underline font-medium"
      >
       Terms of Service
      </Link>{" "}
      and{" "}
      <Link
       to="/privacy"
       className="text-purple-600 hover:text-purple-700 underline font-medium"
      >
       Privacy Policy
      </Link>
      .
     </p>
    </div>

    {/* Bottom Links */}
    <div className="border-t border-gray-200 mt-4 pt-4 flex flex-col lg:flex-row justify-between items-center gap-4 text-sm text-gray-500">
     <div className="flex flex-wrap gap-4">
      <Link
       to="/privacy"
       className="hover:text-purple-600 transition-colors font-medium"
      >
       Privacy Statement
      </Link>
      <span className="text-gray-300">|</span>
      <Link
       to="/security"
       className="hover:text-purple-600 transition-colors font-medium"
      >
       Security
      </Link>
      <span className="text-gray-300">|</span>
      <Link
       to="/legal"
       className="hover:text-purple-600 transition-colors font-medium"
      >
       Legal & Trademarks
      </Link>
      <span className="text-gray-300">|</span>
      <Link
       to="/terms"
       className="hover:text-purple-600 transition-colors font-medium"
      >
       Terms of Service
      </Link>
     </div>
     <div className="text-right">
      <span className="font-medium">
       © 2025 CubeForge, Inc. All Rights Reserved.
      </span>
     </div>
    </div>
   </div>
  </footer>
 );
}
