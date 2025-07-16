"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, TrendingUp, Palette, Bot, Activity, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleVideoWizardProps {
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
}

const STEPS = [
  {
    id: "trend-selection",
    title: "Select Trend",
    description: "Choose trending content to base your video on",
    icon: TrendingUp,
  },
  {
    id: "style-configuration", 
    title: "Configure Style",
    description: "Customize the visual style and platform settings",
    icon: Palette,
  },
  {
    id: "ai-configuration",
    title: "AI Settings",
    description: "Configure AI provider and generation options", 
    icon: Bot,
  },
  {
    id: "generation-progress",
    title: "Generate Video",
    description: "Watch your video being created in real-time",
    icon: Activity,
  },
  {
    id: "preview-edit",
    title: "Preview & Finalize", 
    description: "Review your video and make final adjustments",
    icon: Eye,
  },
];

export function SimpleVideoWizard({
  onComplete,
  onCancel,
  className,
}: SimpleVideoWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState({});

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Wizard completed
      onComplete?.(wizardData);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const StepIcon = currentStepData.icon;

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create AI Video</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Follow these steps to create your viral-ready video using AI
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Step Header */}
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
              <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px] p-6 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <StepIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                <div>
                  <h4 className="text-lg font-medium">{currentStepData.title}</h4>
                  <p className="text-sm text-muted-foreground">{currentStepData.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Step content will be implemented here
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-3 h-3 rounded-full",
                    index <= currentStep
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>

            <Button onClick={handleNext}>
              {currentStep === STEPS.length - 1 ? "Complete" : "Next"}
              {currentStep < STEPS.length - 1 && (
                <ChevronRight className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SimpleVideoWizard;