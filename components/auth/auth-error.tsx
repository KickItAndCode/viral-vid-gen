"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AuthErrorProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function AuthError({
  title = "Authentication Error",
  message = "Something went wrong with authentication. Please try again.",
  onRetry,
  showRetry = true,
}: AuthErrorProps) {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background p-4"
      role="alert"
      aria-live="polite"
    >
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div
            className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1
            className="text-2xl font-bold text-foreground mb-2"
            id="error-title"
          >
            {title}
          </h1>
        </div>

        <Alert variant="destructive" aria-describedby="error-title">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>

        {showRetry && (
          <div className="space-y-4">
            <Button
              onClick={onRetry || (() => window.location.reload())}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <div className="text-center">
              <Button
                variant="link"
                asChild
                className="text-sm text-muted-foreground"
              >
                <a href="/sign-in">Return to Sign In</a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
