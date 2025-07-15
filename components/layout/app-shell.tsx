"use client";

import { ReactNode } from "react";
import { useAuth } from "@clerk/nextjs";
import { AuthLoading } from "@/components/auth";
import { MainNavbar } from "./main-navbar";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { useUIStore } from "@/lib/stores/ui-store";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const { sidebarOpen } = useUIStore();

  if (!isLoaded) {
    return <AuthLoading>{children}</AuthLoading>;
  }

  if (!isSignedIn) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Main Navigation Bar */}
      <MainNavbar />

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:z-40">
          <Sidebar />
        </aside>

        {/* Mobile Navigation Drawer */}
        <MobileNav />

        {/* Main Content Area */}
        <main
          className={`
            flex-1 min-h-0 
            lg:pl-64 
            pt-16
            transition-all duration-300 ease-in-out
            ${sidebarOpen ? "lg:pl-64" : "lg:pl-64"}
          `}
          role="main"
          aria-label="Main content area"
        >
          <div className="h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
