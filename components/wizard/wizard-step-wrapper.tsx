"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardStepProps } from "./types";

interface WizardStepWrapperProps {
  step: WizardStepProps["step"];
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  showStatus?: boolean;
}

export function WizardStepWrapper({
  step,
  children,
  className,
  showHeader = true,
  showStatus = true,
}: WizardStepWrapperProps) {
  const getStatusIcon = () => {
    if (step.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (step.isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    if (step.isValid === true) return "Complete";
    if (step.isValid === false) return "Incomplete";
    return "In Progress";
  };

  const getStatusVariant = () => {
    if (step.isValid === true) return "default";
    if (step.isValid === false) return "destructive";
    return "secondary";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {step.icon}
            <div>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              {step.description && (
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              )}
            </div>
          </div>

          {showStatus && (
            <div className="flex items-center space-x-2">
              {step.isOptional && (
                <Badge variant="outline" className="text-xs">
                  Optional
                </Badge>
              )}
              {step.isSkippable && (
                <Badge variant="outline" className="text-xs">
                  Skippable
                </Badge>
              )}
              <Badge variant={getStatusVariant()} className="text-xs">
                <span className="mr-1">{getStatusIcon()}</span>
                {getStatusText()}
              </Badge>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">{children}</div>
    </div>
  );
}
