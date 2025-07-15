"use client";

import { useAuth } from "@clerk/nextjs";
import { LoadingSpinner } from "./loading-spinner";

interface AuthLoadingProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthLoading({ children, fallback }: AuthLoadingProps) {
  const { isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="progressbar"
        aria-label="Loading application"
      >
        {fallback || (
          <div className="text-center space-y-4">
            <LoadingSpinner size="lg" className="mx-auto" />
            <div className="space-y-2">
              <h2
                className="text-lg font-semibold text-foreground"
                id="loading-title"
              >
                Loading ViralAI
              </h2>
              <p
                className="text-sm text-muted-foreground"
                id="loading-description"
                aria-describedby="loading-title"
              >
                Setting up your creative workspace...
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <>{children}</>;
}
