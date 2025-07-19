"use client";
import { Button } from "@/components/ui/button";

export function HeroSection() {
 return (
  <section className="bg-white border-b max-w-4xl rounded-xl border-gray-200">
   <div className="container mx-auto px-6 py-8">
    <div className="grid md:grid-cols-2 gap-8 items-center">
     <div className="relative">
      <img
       src="/images/dashboard-hero.png"
       alt="3D Design Illustration"
       className="w-full h-auto rounded-lg"
       loading="eager"
       decoding="async"
       onError={(e) => {
        e.currentTarget.src = "/placeholder.svg?height=300&width=400";
       }}
      />
     </div>
     <div>
      <h1 className="md:text-2xl font-bold text-gray-900 mb-4">
       Shape your world with Tinkercad Send-to-Forma
      </h1>
      <p className="text-gray-600 mb-6">
       Level up architectural learning with a new AI-powered workflow.
      </p>
      <Button variant="purple" className="text-white px-6 py-2 rounded-full">
       Learn more
      </Button>
     </div>
    </div>
   </div>
  </section>
 );
}
