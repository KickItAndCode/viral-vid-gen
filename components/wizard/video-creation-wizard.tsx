"use client";

import React, { useCallback, useMemo } from "react";
import { WizardContainer } from "./wizard-container";
import { WizardProvider } from "./wizard-provider";
import { WizardConfig } from "./types";
import { TrendSelectionStep } from "./steps/trend-selection-step";
import { StyleConfigurationStep } from "./steps/style-configuration-step";
import { AIConfigurationStep } from "./steps/ai-configuration-step";
import { GenerationProgressStep } from "./steps/generation-progress-step";
import { PreviewEditStep } from "./steps/preview-edit-step";
import { TrendingUp, Palette, Bot, Activity, Eye } from "lucide-react";

interface VideoCreationWizardProps {
  onComplete?: (data: any) => void;
  onCancel?: () => void;
  className?: string;
  sessionId?: string;
}

// Create step icons as static elements to prevent re-renders
const TrendIcon = <TrendingUp className="h-5 w-5 text-primary" />;
const StyleIcon = <Palette className="h-5 w-5 text-primary" />;
const AIIcon = <Bot className="h-5 w-5 text-primary" />;
const ProgressIcon = <Activity className="h-5 w-5 text-primary" />;
const PreviewIcon = <Eye className="h-5 w-5 text-primary" />;

const wizardConfig: WizardConfig = {
  id: "video-creation-wizard",
  title: "Create AI Video",
  description: "Follow these steps to create your viral-ready video using AI",
  allowSkipSteps: false,
  allowBackNavigation: true,
  autoSave: true,
  autoSaveInterval: 30000, // 30 seconds
  persistToStorage: true,
  storageKey: "viralai_video_wizard",
  steps: [
    {
      id: "trend-selection",
      title: "Select Trend",
      description: "Choose trending content to base your video on",
      icon: TrendIcon,
      component: TrendSelectionStep,
      isOptional: false,
      isSkippable: false,
    },
    {
      id: "style-configuration",
      title: "Configure Style",
      description: "Customize the visual style and platform settings",
      icon: StyleIcon,
      component: StyleConfigurationStep,
      isOptional: false,
      isSkippable: false,
    },
    {
      id: "ai-configuration",
      title: "AI Settings",
      description: "Configure AI provider and generation options",
      icon: AIIcon,
      component: AIConfigurationStep,
      isOptional: false,
      isSkippable: false,
    },
    {
      id: "generation-progress",
      title: "Generate Video",
      description: "Watch your video being created in real-time",
      icon: ProgressIcon,
      component: GenerationProgressStep,
      isOptional: false,
      isSkippable: false,
    },
    {
      id: "preview-edit",
      title: "Preview & Finalize",
      description: "Review your video and make final adjustments",
      icon: PreviewIcon,
      component: PreviewEditStep,
      isOptional: false,
      isSkippable: false,
    },
  ],
};

export function VideoCreationWizard({
  onComplete,
  onCancel,
  className,
  sessionId,
}: VideoCreationWizardProps) {
  const handleComplete = useCallback(async (data: any) => {
    console.log("Video creation completed:", data);
    if (onComplete) {
      await onComplete(data);
    }
  }, [onComplete]);

  const handleCancel = useCallback((data: any) => {
    console.log("Video creation cancelled:", data);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  const handleStepChange = useCallback((stepIndex: number, stepId: string, data: any) => {
    console.log(`Step changed to ${stepIndex} (${stepId}):`, data);
  }, []);

  const handleDataChange = useCallback((data: any) => {
    console.log("Wizard data changed:", data);
  }, []);

  const handleError = useCallback((error: Error, stepIndex: number) => {
    console.error(`Error in step ${stepIndex}:`, error);
  }, []);

  const configWithHandlers: WizardConfig = useMemo(() => ({
    ...wizardConfig,
    onComplete: handleComplete,
    onCancel: handleCancel,
    onStepChange: handleStepChange,
    onDataChange: handleDataChange,
    onError: handleError,
  }), [handleComplete, handleCancel, handleStepChange, handleDataChange, handleError]);

  return (
    <WizardProvider
      config={configWithHandlers}
      autoLoadProgress={true}
      sessionId={sessionId}
    >
      <WizardContainer
        config={configWithHandlers}
        className={className}
        onClose={onCancel}
        showProgress={true}
        showStepNumbers={true}
        allowClose={true}
        persistProgress={true}
      />
    </WizardProvider>
  );
}

export default VideoCreationWizard;
