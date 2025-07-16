"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AuthLoading } from "./auth-loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({
  children,
  fallback,
  redirectTo = "/sign-in",
}: ProtectedRouteProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  // Skip authentication in development for testing
  if (process.env.NODE_ENV === "development") {
    console.log("Development mode: Bypassing ProtectedRoute authentication");
    return <>{children}</>;
  }

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push(redirectTo as any);
    }
  }, [isLoaded, isSignedIn, router, redirectTo]);

  if (!isLoaded) {
    return <AuthLoading fallback={fallback}>{children}</AuthLoading>;
  }

  if (!isSignedIn) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
