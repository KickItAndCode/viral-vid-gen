"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Video,
  TrendingUp,
  BarChart3,
  Settings,
  Library,
  Zap,
  Crown,
  Scissors,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const mainNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    name: "Create Video",
    href: "/dashboard/create",
    icon: Video,
    description: "Generate viral content",
  },
  {
    name: "Trending",
    href: "/dashboard/trends",
    icon: TrendingUp,
    description: "Discover viral content",
  },
  {
    name: "Video Library",
    href: "/dashboard/library",
    icon: Library,
    description: "Manage your videos",
  },
  {
    name: "Video Editor",
    href: "/dashboard/editor",
    icon: Scissors,
    description: "Edit and enhance videos",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
    description: "Performance insights",
  },
];

const bottomNavigation = [
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    description: "App preferences",
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col bg-background border-r border-border",
        className
      )}
    >
      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                tabIndex={0}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.name}</div>
                  <div
                    className={cn(
                      "text-xs truncate transition-colors",
                      isActive ? "text-primary/70" : "text-muted-foreground/70"
                    )}
                  >
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <Separator className="my-6" />

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </h3>

          <Button
            className="w-full justify-start bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white border-0"
            asChild
          >
            <Link href="/dashboard/create">
              <Zap className="mr-2 h-4 w-4" />
              Create Video
            </Link>
          </Button>

          <Button variant="outline" className="w-full justify-start" asChild>
            <Link href="/dashboard/trends">
              <TrendingUp className="mr-2 h-4 w-4" />
              Browse Trends
            </Link>
          </Button>
        </div>

        <Separator className="my-6" />

        {/* Upgrade Section */}
        <div className="px-3 py-4 bg-gradient-to-br from-primary/5 to-blue-600/5 rounded-lg border border-primary/10">
          <div className="flex items-center mb-2">
            <Crown className="h-4 w-4 text-primary mr-2" />
            <span className="text-sm font-semibold text-foreground">
              Upgrade to Pro
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Unlock unlimited video generation and premium features
          </p>
          <Button size="sm" className="w-full" asChild>
            <Link href={"/dashboard/billing" as any}>Upgrade Now</Link>
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-border p-3">
        <nav className="space-y-1">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
                tabIndex={0}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 flex-shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
