"use client";

import Link from "next/link";
import { Menu, Bell, Search, Video, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "./user-menu";
import { useUIStore } from "@/lib/stores/ui-store";
import { cn } from "@/lib/utils";

export function MainNavbar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border z-50">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section - Logo & Mobile Menu */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden focus:outline-none focus:ring-2 focus:ring-primary/20"
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl text-foreground hidden sm:block">
              ViralAI
            </span>
          </Link>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-xl mx-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trends and videos..."
              className="pl-10 pr-4 w-full bg-muted/50 border-0 focus:bg-background"
            />
          </div>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center space-x-2">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center space-x-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/create">
                <Video className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>

            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/trends">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trends
              </Link>
            </Button>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Mobile Search */}
          <Button variant="ghost" size="sm" className="md:hidden">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>

          {/* User Menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
