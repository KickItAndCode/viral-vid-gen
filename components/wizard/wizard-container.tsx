"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Check, 
  SkipForward,
  AlertCircle,
  Save,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WizardConfig, WizardStep, WizardStepProps } from "./types";
import { useWizardStore } from "./wizard-store";

interface WizardContainerProps {
  config: WizardConfig;
  className?: string;
  onClose?: () => void;
  showProgress?: boolean;
  showStepNumbers?: boolean;
  allowClose?: boolean;
  persistProgress?: boolean;
}

export function WizardContainer({
  config,
  className,
  onClose,
  showProgress = true,
  showStepNumbers = true,
  allowClose = true,
  persistProgress = true,
}: WizardContainerProps) {
  const {
    currentStepIndex,
    currentStepId,
    totalSteps,
    data,
    isCompleted,
    isLoading,
    error,
    goToStep,
    nextStep,
    previousStep,
    skipStep,
    updateStepData,
    completeWizard,
    cancelWizard,
    validateStep,
    canProceedToStep,
    setError,
    setLoading,
    saveProgress,
    resetWizard,
  } = useWizardStore();

  const [stepValidations, setStepValidations] = useState<Record<string, boolean>>({});

  // Initialize wizard
  useEffect(() => {
    useWizardStore.setState({
      totalSteps: config.steps.length,
      currentStepId: config.steps[0]?.id || "",
    });
  }, [config.steps]);

  // Update current step ID when step index changes
  useEffect(() => {
    const step = config.steps[currentStepIndex];
    if (step && step.id !== currentStepId) {
      useWizardStore.setState({ currentStepId: step.id });
    }
  }, [currentStepIndex, config.steps, currentStepId]);

  // Auto-save progress
  useEffect(() => {
    if (persistProgress && config.autoSave && !isCompleted) {
      const interval = setInterval(() => {
        saveProgress();
      }, config.autoSaveInterval || 30000); // Default 30 seconds

      return () => clearInterval(interval);
    }
  }, [persistProgress, config.autoSave, config.autoSaveInterval, isCompleted, saveProgress]);

  // Validate current step
  const validateCurrentStep = useCallback((): boolean => {
    const currentStep = config.steps[currentStepIndex];
    if (!currentStep) return false;

    // Custom step validation if provided
    if (currentStep.isValid !== undefined) {
      return currentStep.isValid;
    }

    // Default validation based on step data
    const stepData = getStepData(currentStep.id);
    const isValid = validateStepData(currentStep.id, stepData);
    
    setStepValidations(prev => ({
      ...prev,
      [currentStep.id]: isValid,
    }));

    return isValid;
  }, [currentStepIndex, config.steps, data]);

  // Get step-specific data
  const getStepData = (stepId: string) => {
    switch (stepId) {
      case "trend-selection":
        return data.selectedTrend ? { selectedTrend: data.selectedTrend } : {};
      case "style-configuration":
        return data.videoStyle ? { videoStyle: data.videoStyle } : {};
      case "ai-configuration":
        return data.aiSettings ? { aiSettings: data.aiSettings } : {};
      case "generation-progress":
        return data.generation ? { generation: data.generation } : {};
      case "preview-edit":
        return data.preview ? { preview: data.preview } : {};
      default:
        return {};
    }
  };

  // Basic validation function
  const validateStepData = (stepId: string, stepData: any): boolean => {
    switch (stepId) {
      case "trend-selection":
        return !!stepData.selectedTrend;
      case "style-configuration":
        return !!stepData.videoStyle?.style && !!stepData.videoStyle?.duration;
      case "ai-configuration":
        return !!stepData.aiSettings?.provider;
      default:
        return true;
    }
  };

  // Navigation handlers
  const handleNext = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      setError("Please complete all required fields before proceeding");
      return;
    }

    setError(null);
    
    // Call step change callback
    if (config.onStepChange) {
      config.onStepChange(currentStepIndex, currentStepId, data);
    }

    if (currentStepIndex === totalSteps - 1) {
      await handleComplete();
    } else {
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0 && (config.allowBackNavigation !== false)) {
      previousStep();
      setError(null);
    }
  };

  const handleSkip = () => {
    const currentStep = config.steps[currentStepIndex];
    if (currentStep?.isSkippable && config.allowSkipSteps) {
      skipStep();
      setError(null);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    if (canProceedToStep(stepIndex)) {
      goToStep(stepIndex);
      setError(null);
    }
  };

  const handleDataChange = (stepId: string, stepData: Record<string, any>) => {
    updateStepData(stepId, stepData);
    
    // Trigger validation for the current step
    setTimeout(() => validateCurrentStep(), 0);
    
    // Call data change callback
    if (config.onDataChange) {
      config.onDataChange(data);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    try {
      if (config.onComplete) {
        await config.onComplete(data);
      }
      completeWizard();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to complete wizard");
      if (config.onError) {
        config.onError(error as Error, currentStepIndex);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (config.onCancel) {
      config.onCancel(data);
    }
    cancelWizard();
    onClose?.();
  };

  const handleReset = () => {
    resetWizard();
    setError(null);
  };

  // Get current step
  const currentStep = config.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;
  const canProceed = validateCurrentStep();
  const canGoBack = currentStepIndex > 0 && (config.allowBackNavigation !== false);

  if (!currentStep) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No wizard steps configured</p>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card className={cn("w-full max-w-4xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Wizard Completed!</h2>
          <p className="text-muted-foreground mb-6">
            Your video creation has been successfully processed.
          </p>
          {onClose && (
            <Button onClick={onClose} size="lg">
              Continue to Dashboard
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const stepProps: WizardStepProps = {
    step: currentStep,
    currentStepIndex,
    totalSteps,
    wizardData: data,
    onDataChange: handleDataChange,
    onNext: handleNext,
    onPrevious: handlePrevious,
    onSkip: currentStep.isSkippable ? handleSkip : undefined,
    onComplete: handleComplete,
    isFirstStep,
    isLastStep,
    canProceed,
    canGoBack,
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{config.title}</h1>
          {config.description && (
            <p className="text-muted-foreground mt-1">{config.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {persistProgress && (
            <Button
              variant="outline"
              size="sm"
              onClick={saveProgress}
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Progress
            </Button>
          )}
          
          {allowClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStepIndex + 1} of {totalSteps}
            </span>
            <span className="text-muted-foreground">
              {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete
            </span>
          </div>
          <Progress value={((currentStepIndex + 1) / totalSteps) * 100} />
        </div>
      )}

      {/* Step Navigation */}
      {showStepNumbers && (
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
          {config.steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            const isAccessible = canProceedToStep(index);
            const isValid = stepValidations[step.id] !== false;

            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible || isLoading}
                  className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                    isActive && "bg-primary text-primary-foreground",
                    isCompleted && "bg-green-500 text-white",
                    !isActive && !isCompleted && isAccessible && "bg-muted hover:bg-muted/80",
                    !isAccessible && "bg-muted/50 text-muted-foreground cursor-not-allowed",
                    !isValid && index <= currentStepIndex && "bg-red-500 text-white"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </button>
                {index < config.steps.length - 1 && (
                  <div className="w-8 h-px bg-muted mx-1" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Current Step Title */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          {currentStep.icon}
          <h2 className="text-xl font-semibold">{currentStep.title}</h2>
        </div>
        {currentStep.description && (
          <p className="text-muted-foreground">{currentStep.description}</p>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          <currentStep.component {...stepProps} />
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {canGoBack && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          
          {currentStep.isSkippable && config.allowSkipSteps && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={isLoading}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              "Processing..."
            ) : isLastStep ? (
              "Complete"
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Step Status Indicators */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        {currentStep.isOptional && (
          <Badge variant="secondary">Optional</Badge>
        )}
        {currentStep.isSkippable && (
          <Badge variant="outline">Skippable</Badge>
        )}
        {!canProceed && (
          <Badge variant="destructive">Incomplete</Badge>
        )}
      </div>
    </div>
  );
}