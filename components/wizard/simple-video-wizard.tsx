"use client";

import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Palette,
  Bot,
  Activity,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardData, WizardStep } from "./types";
import { TrendSelectionStep } from "./steps/trend-selection-step";
import { StyleConfigurationStep } from "./steps/style-configuration-step";
import { AIConfigurationStep } from "./steps/ai-configuration-step";
import { GenerationProgressStep } from "./steps/generation-progress-step";
import { PreviewEditStep } from "./steps/preview-edit-step";

interface SimpleVideoWizardProps {
  onComplete?: (data: WizardData) => void;
  onCancel?: () => void;
  className?: string;
  initialTrendId?: string;
}

const STEPS: WizardStep[] = [
  {
    id: "trend-selection",
    title: "Select Trend",
    description: "Choose trending content to base your video on",
    icon: <TrendingUp className="h-5 w-5 text-primary" />,
    component: TrendSelectionStep,
    isValid: false,
  },
  {
    id: "style-configuration",
    title: "Configure Style",
    description: "Customize the visual style and platform settings",
    icon: <Palette className="h-5 w-5 text-primary" />,
    component: StyleConfigurationStep,
    isValid: false,
  },
  {
    id: "ai-configuration",
    title: "AI Settings",
    description: "Configure AI provider and generation options",
    icon: <Bot className="h-5 w-5 text-primary" />,
    component: AIConfigurationStep,
    isValid: false,
  },
  {
    id: "generation-progress",
    title: "Generate Video",
    description: "Watch your video being created in real-time",
    icon: <Activity className="h-5 w-5 text-primary" />,
    component: GenerationProgressStep,
    isValid: false,
  },
  {
    id: "preview-edit",
    title: "Preview & Finalize",
    description: "Review your video and make final adjustments",
    icon: <Eye className="h-5 w-5 text-primary" />,
    component: PreviewEditStep,
    isValid: false,
  },
];

export function SimpleVideoWizard({
  onComplete,
  onCancel,
  className,
  initialTrendId,
}: SimpleVideoWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [wizardData, setWizardData] = useState<WizardData>({
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sessionId: `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...(initialTrendId && { selectedTrend: { id: initialTrendId } as any }),
  });

  const handleNext = useCallback(() => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Wizard completed
      onComplete?.(wizardData);
    }
  }, [currentStep, wizardData, onComplete]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  const handleDataChange = useCallback(
    (stepId: string, data: Record<string, any>) => {
      setWizardData((prev) => ({
        ...prev,
        ...data,
        updatedAt: Date.now(),
      }));
    },
    []
  );

  const handleStepComplete = useCallback(() => {
    // Automatically move to next step when current step is completed
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete?.(wizardData);
    }
  }, [currentStep, wizardData, onComplete]);

  const currentStepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentStepComponent = currentStepData.component;

  // Check if current step is valid
  const isCurrentStepValid = () => {
    switch (currentStepData.id) {
      case "trend-selection":
        return !!wizardData.selectedTrend;
      case "style-configuration":
        return !!wizardData.videoStyle?.style;
      case "ai-configuration":
        return !!wizardData.aiSettings?.provider;
      case "generation-progress":
        return wizardData.generation?.status === "completed";
      case "preview-edit":
        return !!wizardData.generation?.videoUrl; // Valid if video was generated
      default:
        return false;
    }
  };

  const canProceed = isCurrentStepValid();

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
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
              <span>
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step Content */}
          <div className="min-h-[600px]">
            <CurrentStepComponent
              step={currentStepData}
              currentStepIndex={currentStep}
              totalSteps={STEPS.length}
              wizardData={wizardData}
              onDataChange={handleDataChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              onComplete={handleStepComplete}
              isFirstStep={currentStep === 0}
              isLastStep={currentStep === STEPS.length - 1}
              canProceed={canProceed}
              canGoBack={currentStep > 0}
            />
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "w-3 h-3 rounded-full transition-colors",
                    index < currentStep
                      ? "bg-primary"
                      : index === currentStep
                        ? "bg-primary/70"
                        : "bg-muted-foreground/20"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canProceed && currentStep < STEPS.length - 1}
            >
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
