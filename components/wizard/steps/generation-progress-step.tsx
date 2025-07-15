"use client";

import React, { useState, useEffect } from "react";
import { WizardStepProps } from "../types";
import { WizardStepWrapper } from "../wizard-step-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Video,
  Wand2,
  Loader2,
  Eye,
  Download,
  RotateCcw,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GenerationProgressStepProps extends WizardStepProps {}

// Generation stages
const GENERATION_STAGES = [
  {
    id: "script-generation",
    name: "Script Generation",
    description: "Creating AI-powered script from trending content",
    icon: <Sparkles className="h-4 w-4" />,
    estimatedTime: "10-20s",
  },
  {
    id: "prompt-optimization",
    name: "Prompt Optimization",
    description: "Optimizing prompts for AI video generation",
    icon: <Settings className="h-4 w-4" />,
    estimatedTime: "5-10s",
  },
  {
    id: "video-generation",
    name: "Video Generation",
    description: "AI model creating your video content",
    icon: <Video className="h-4 w-4" />,
    estimatedTime: "60-240s",
  },
  {
    id: "post-processing",
    name: "Post-Processing",
    description: "Adding effects, music, and final touches",
    icon: <Wand2 className="h-4 w-4" />,
    estimatedTime: "15-30s",
  },
];

// Mock generation states for demo
type GenerationStatus = "pending" | "running" | "completed" | "error";

interface GenerationState {
  currentStage: number;
  stages: Array<{
    id: string;
    status: GenerationStatus;
    progress: number;
    message?: string;
    timeElapsed?: number;
  }>;
  overallProgress: number;
  isCompleted: boolean;
  hasError: boolean;
  errorMessage?: string;
  estimatedTimeRemaining?: string;
  canPreview: boolean;
  videoUrl?: string;
}

export function GenerationProgressStep(props: GenerationProgressStepProps) {
  const { wizardData, onDataChange } = props;

  // State for generation progress
  const [generationState, setGenerationState] = useState<GenerationState>({
    currentStage: 0,
    stages: GENERATION_STAGES.map((stage) => ({
      id: stage.id,
      status: "pending" as GenerationStatus,
      progress: 0,
    })),
    overallProgress: 0,
    isCompleted: false,
    hasError: false,
    canPreview: false,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Start generation when component loads (simulate)
  useEffect(() => {
    if (!isGenerating && !generationState.isCompleted) {
      startGeneration();
    }
  }, []);

  const startGeneration = async () => {
    setIsGenerating(true);

    // Simulate generation process
    for (
      let stageIndex = 0;
      stageIndex < GENERATION_STAGES.length;
      stageIndex++
    ) {
      const stage = GENERATION_STAGES[stageIndex];

      // Update current stage
      setGenerationState((prev) => ({
        ...prev,
        currentStage: stageIndex,
        stages: prev.stages.map((s, i) => ({
          ...s,
          status:
            i === stageIndex
              ? "running"
              : i < stageIndex
                ? "completed"
                : "pending",
          progress: i < stageIndex ? 100 : 0,
        })),
      }));

      // Simulate stage progress
      const stageDuration = getRandomDuration(stage.id);
      const progressSteps = 10;
      const stepDelay = stageDuration / progressSteps;

      for (let step = 0; step <= progressSteps; step++) {
        const progress = (step / progressSteps) * 100;
        const overallProgress =
          (stageIndex * 100 + progress) / GENERATION_STAGES.length;

        setGenerationState((prev) => ({
          ...prev,
          stages: prev.stages.map((s, i) => ({
            ...s,
            progress: i === stageIndex ? progress : i < stageIndex ? 100 : 0,
          })),
          overallProgress,
          estimatedTimeRemaining: calculateTimeRemaining(
            stageIndex,
            step,
            progressSteps
          ),
        }));

        await new Promise((resolve) => setTimeout(resolve, stepDelay));
      }

      // Mark stage as completed
      setGenerationState((prev) => ({
        ...prev,
        stages: prev.stages.map((s, i) => ({
          ...s,
          status: i <= stageIndex ? "completed" : "pending",
          progress: i <= stageIndex ? 100 : 0,
        })),
      }));
    }

    // Generation completed
    setGenerationState((prev) => ({
      ...prev,
      isCompleted: true,
      canPreview: true,
      overallProgress: 100,
      videoUrl: "/api/mock-video-url",
    }));

    setIsGenerating(false);

    // Update wizard data
    onDataChange("generation-progress", {
      generationCompleted: true,
      videoUrl: "/api/mock-video-url",
      generatedAt: new Date().toISOString(),
    });
  };

  const getRandomDuration = (stageId: string): number => {
    const durations = {
      "script-generation": 2000,
      "prompt-optimization": 1000,
      "video-generation": 8000,
      "post-processing": 3000,
    };
    return durations[stageId as keyof typeof durations] || 2000;
  };

  const calculateTimeRemaining = (
    currentStageIndex: number,
    currentStep: number,
    totalSteps: number
  ): string => {
    const remainingStages = GENERATION_STAGES.length - currentStageIndex - 1;
    const currentStageProgress = currentStep / totalSteps;
    const averageStageTime = 30; // seconds

    const remaining =
      remainingStages * averageStageTime +
      (1 - currentStageProgress) * averageStageTime;

    if (remaining < 60) {
      return `${Math.ceil(remaining)}s remaining`;
    } else {
      return `${Math.ceil(remaining / 60)}m ${Math.ceil(remaining % 60)}s remaining`;
    }
  };

  const handleRetry = () => {
    setGenerationState({
      currentStage: 0,
      stages: GENERATION_STAGES.map((stage) => ({
        id: stage.id,
        status: "pending" as GenerationStatus,
        progress: 0,
      })),
      overallProgress: 0,
      isCompleted: false,
      hasError: false,
      canPreview: false,
    });
    startGeneration();
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const currentStageData = GENERATION_STAGES[generationState.currentStage];

  return (
    <WizardStepWrapper step={props.step}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Activity className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Generating Your Video</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your AI-powered video is being created. This may take a few minutes.
          </p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                {generationState.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                ) : generationState.hasError ? (
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                ) : (
                  <Loader2 className="h-5 w-5 text-primary mr-2 animate-spin" />
                )}
                {generationState.isCompleted
                  ? "Generation Complete!"
                  : generationState.hasError
                    ? "Generation Failed"
                    : "Generating Video..."}
              </CardTitle>
              <Badge
                variant={generationState.isCompleted ? "default" : "secondary"}
              >
                {Math.round(generationState.overallProgress)}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress
                value={generationState.overallProgress}
                className="w-full"
              />

              {generationState.estimatedTimeRemaining &&
                !generationState.isCompleted && (
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    {generationState.estimatedTimeRemaining}
                  </div>
                )}

              {generationState.isCompleted && (
                <div className="text-center space-y-2">
                  <p className="text-green-700 font-medium">
                    🎉 Your video has been generated successfully!
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={handlePreview} variant="default">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Video
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {generationState.hasError && (
                <div className="text-center space-y-2">
                  <p className="text-red-700 font-medium">
                    ❌ Generation failed. Please try again.
                  </p>
                  <Button onClick={handleRetry} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Retry Generation
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generation Stages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generation Progress</h3>

          <div className="space-y-3">
            {GENERATION_STAGES.map((stage, index) => {
              const stageState = generationState.stages[index];
              const isActive = generationState.currentStage === index;
              const isCompleted = stageState.status === "completed";
              const isError = stageState.status === "error";

              return (
                <Card
                  key={stage.id}
                  className={cn(
                    "transition-all",
                    isActive && "ring-2 ring-primary",
                    isCompleted && "bg-green-50 border-green-200",
                    isError && "bg-red-50 border-red-200"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={cn(
                          "p-2 rounded-full",
                          isCompleted
                            ? "bg-green-100 text-green-600"
                            : isError
                              ? "bg-red-100 text-red-600"
                              : isActive
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isError ? (
                          <AlertCircle className="h-4 w-4" />
                        ) : isActive ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          stage.icon
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{stage.name}</h4>
                          <span className="text-sm text-muted-foreground">
                            {Math.round(stageState.progress)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {stage.description}
                        </p>

                        {(isActive || isCompleted) && (
                          <Progress
                            value={stageState.progress}
                            className="w-full h-2"
                          />
                        )}

                        {!isActive && !isCompleted && !isError && (
                          <div className="text-xs text-muted-foreground">
                            Est. {stage.estimatedTime}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Configuration Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-muted-foreground">
                  Provider:
                </span>
                <p>{wizardData.aiConfiguration?.provider || "Veo 3"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Style:
                </span>
                <p>{wizardData.videoStyle?.style || "Educational"}</p>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">
                  Duration:
                </span>
                <p>{wizardData.videoStyle?.duration || 30} seconds</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Modal Placeholder */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Video Preview</CardTitle>
                  <Button variant="ghost" onClick={() => setShowPreview(false)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-2" />
                    <p>Video preview would appear here</p>
                    <p className="text-sm">
                      Integration with video player in next phase
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Help Text */}
        {!generationState.isCompleted && (
          <div className="text-center text-sm text-muted-foreground">
            <p>
              💡 <strong>Tip:</strong> Generation time varies by AI provider and
              video complexity. You can safely close this tab - we'll notify you
              when it's ready!
            </p>
          </div>
        )}
      </div>
    </WizardStepWrapper>
  );
}
