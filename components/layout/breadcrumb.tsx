"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

// Route mapping for automatic breadcrumb generation
const routeMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/create": "Create Video",
  "/dashboard/trends": "Trending Content",
  "/dashboard/library": "Video Library",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  "/dashboard/profile": "Profile",
  "/dashboard/billing": "Billing",
};

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs from current path if no items provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);

  if (breadcrumbItems.length <= 1) {
    return null; // Don't show breadcrumbs for single-level pages
  }

  return (
    <nav 
      className={cn("flex items-center space-x-1 text-sm text-muted-foreground", className)}
      aria-label="Breadcrumb navigation"
    >
      <ol className="flex items-center space-x-1">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={item.href || item.label} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground/50" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  href={item.href as any}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </Link>
              ) : (
                <span 
                  className={cn(
                    "flex items-center",
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && <Icon className="h-4 w-4 mr-1" />}
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with home/dashboard
  breadcrumbs.push({
    label: "Dashboard",
    href: "/dashboard",
    icon: Home
  });

  // Build path progressively
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    
    // Skip the first segment if it's 'dashboard' (already added)
    if (segments[i] === 'dashboard' && i === 0) continue;

    const label = routeMap[currentPath] || 
      segments[i].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');

    breadcrumbs.push({
      label,
      href: i === segments.length - 1 ? undefined : currentPath // No href for current page
    });
  }

  return breadcrumbs;
}