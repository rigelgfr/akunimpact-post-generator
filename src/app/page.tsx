import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6">
      <div className="max-w-md w-full flex flex-col items-center space-y-8 text-center">
        {/* Logo with subtle animation */}
        <div className="relative mb-2 transition-all duration-700 hover:scale-105">
          <div className="absolute -inset-4 bg-blue-100 rounded-full opacity-30 blur-xl"></div>
          <Image
            src="/logo/logo.png"
            alt="Logo"
            width={120}
            height={120}
            className="relative"
            priority
          />
        </div>
        
        {/* Welcome text */}
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            AKUNIMPACT Post Generator
          </h1>
          <p className="text-slate-600 max-w-sm mx-auto">
            Generate  posts or test the UID detection model on your own images.
          </p>
        </div>

        {/* Action buttons with better styling */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-4">
          <Button 
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-colors"
            size="lg"
            asChild
          >
            <Link href="/generator" className="flex items-center gap-2">
              <Zap size={18} />
              Create a Post
            </Link>
          </Button>

          <Button 
            className="w-full sm:w-auto" 
            variant="outline"
            size="lg"
            asChild
          >
            <Link href="/detector" className="flex items-center gap-2">
              Test the Model
              <ArrowRight size={16} />
            </Link>
          </Button>
        </div>

        {/* Footer section */}
        <div className="text-xs text-slate-500 pt-12">
          <p>Made by @rigelgfr</p>
        </div>
      </div>
    </div>
  );
}