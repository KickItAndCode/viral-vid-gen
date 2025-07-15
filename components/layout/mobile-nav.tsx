"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUIStore } from "@/lib/stores/ui-store";
import { Sidebar } from "./sidebar";

export function MobileNav() {
  const { sidebarOpen, closeSidebar } = useUIStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={(open) => !open && closeSidebar()}>
      <SheetContent
        side="left"
        className="w-64 p-0 lg:hidden"
        aria-describedby="mobile-navigation-description"
      >
        <SheetHeader className="px-3 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">V</span>
              </div>
              <span className="font-bold text-lg">ViralAI</span>
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeSidebar}
              className="h-6 w-6 p-0"
              aria-label="Close navigation menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div id="mobile-navigation-description" className="sr-only">
          Mobile navigation menu with links to dashboard, video creation,
          trends, and settings
        </div>

        <div className="flex-1 overflow-y-auto">
          <Sidebar />
        </div>
      </SheetContent>
    </Sheet>
  );
}
