"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Simplified wizard data for MVP
interface MVPWizardData {
  topic: string;
  trendId?: string;
  style: "comedy" | "educational" | "promotional";
}

interface MVPVideoWizardProps {
  onComplete?: (data: MVPWizardData) => void;
  onCancel?: () => void;
  className?: string;
}

export function MVPVideoWizard({ onComplete, onCancel, className }: MVPVideoWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<MVPWizardData>({
    topic: "",
    style: "educational",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const steps = [
    {
      title: "Choose Your Topic",
      description: "Select a trending topic or enter your own",
    },
    {
      title: "Generate Video",
      description: "Select style and create your video",
    },
  ];

  const handleNext = () => {
    if (currentStep === 0 && data.topic) {
      setCurrentStep(1);
    } else if (currentStep === 1) {
      handleGenerate();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate generation progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          onComplete?.(data);
          return 100;
        }
        return prev + 10;
      });
    }, 600);
  };

  const trendingTopics = [
    "AI and the Future of Work",
    "30-Day Fitness Challenge",
    "Quick Healthy Recipes",
    "Personal Finance Tips",
    "Productivity Hacks",
    "Mental Health Awareness",
    "Sustainable Living",
    "Tech Product Reviews",
    "Travel on a Budget",
    "Learning New Skills",
  ];

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <span className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {steps.length}
          </span>
        </div>
        <Progress value={(currentStep + 1) * 50} className="mb-2" />
        <p className="text-sm text-muted-foreground">{steps[currentStep].description}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 0 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select a trending topic or enter your own
              </label>
              <input
                type="text"
                value={data.topic}
                onChange={(e) => setData({ ...data, topic: e.target.value })}
                placeholder="Enter your topic..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending Topics
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {trendingTopics.map((topic) => (
                  <Button
                    key={topic}
                    variant={data.topic === topic ? "default" : "outline"}
                    size="sm"
                    onClick={() => setData({ ...data, topic })}
                    className="justify-start"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentStep === 1 && !isGenerating && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-3">Selected Topic</h3>
              <p className="text-lg font-semibold">{data.topic}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-3">Choose Video Style</h3>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant={data.style === "comedy" ? "default" : "outline"}
                  onClick={() => setData({ ...data, style: "comedy" })}
                  className="h-20 flex flex-col gap-2"
                >
                  <span className="text-2xl">😂</span>
                  <span>Comedy</span>
                </Button>
                <Button
                  variant={data.style === "educational" ? "default" : "outline"}
                  onClick={() => setData({ ...data, style: "educational" })}
                  className="h-20 flex flex-col gap-2"
                >
                  <span className="text-2xl">🎓</span>
                  <span>Educational</span>
                </Button>
                <Button
                  variant={data.style === "promotional" ? "default" : "outline"}
                  onClick={() => setData({ ...data, style: "promotional" })}
                  className="h-20 flex flex-col gap-2"
                >
                  <span className="text-2xl">📢</span>
                  <span>Promotional</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="space-y-4 py-8">
            <div className="text-center space-y-2">
              <Sparkles className="h-12 w-12 mx-auto text-primary animate-pulse" />
              <h3 className="text-lg font-semibold">Generating Your Video</h3>
              <p className="text-sm text-muted-foreground">
                This will take about 60 seconds...
              </p>
            </div>
            <Progress value={generationProgress} className="w-full" />
            <p className="text-center text-sm text-muted-foreground">
              {generationProgress}% Complete
            </p>
          </div>
        )}
      </CardContent>

      <div className="px-6 pb-6 flex justify-between">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : handleBack}
          disabled={isGenerating}
        >
          {currentStep === 0 ? "Cancel" : <><ArrowLeft className="h-4 w-4 mr-2" /> Back</>}
        </Button>
        <Button
          onClick={handleNext}
          disabled={!data.topic || isGenerating}
          className="min-w-[120px]"
        >
          {currentStep === 0 ? (
            <>Next <ArrowRight className="h-4 w-4 ml-2" /></>
          ) : isGenerating ? (
            "Generating..."
          ) : (
            <>Generate Video <Sparkles className="h-4 w-4 ml-2" /></>
          )}
        </Button>
      </div>
    </Card>
  );
}