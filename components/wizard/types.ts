import { ReactNode } from "react";
import { Id } from "@/convex/_generated/dataModel";

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  component: React.ComponentType<WizardStepProps>;
  isValid?: boolean;
  isOptional?: boolean;
  isSkippable?: boolean;
  data?: Record<string, any>;
}

export interface WizardStepProps {
  step: WizardStep;
  currentStepIndex: number;
  totalSteps: number;
  wizardData: WizardData;
  onDataChange: (stepId: string, data: Record<string, any>) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSkip?: () => void;
  onComplete: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  canProceed: boolean;
  canGoBack: boolean;
}

export interface WizardData {
  // Step 1: Trend Selection
  selectedTrend?: {
    id: Id<"trends">;
    title: string;
    description: string;
    platform: string;
    category: string;
    viralScore: number;
    tags: string[];
    engagementMetrics: Record<string, number>;
  };
  
  // Step 2: Style Configuration
  videoStyle?: {
    style: "educational" | "entertaining" | "dramatic" | "minimalist" | "cinematic";
    tone: "professional" | "casual" | "humorous" | "serious" | "inspiring";
    visualStyle: "realistic" | "animated" | "abstract" | "documentary";
    duration: number;
    targetPlatform: "youtube" | "tiktok" | "instagram" | "twitter";
    aspectRatio: "16:9" | "9:16" | "1:1";
    resolution: "720p" | "1080p" | "4k";
    fps: 24 | 30 | 60;
  };
  
  // Step 3: AI Configuration
  aiSettings?: {
    provider: "veo" | "runway" | "luma" | "auto";
    priority: "low" | "normal" | "high";
    customPrompt?: string;
    useCustomPrompt: boolean;
    generatedScript?: {
      prompt: string;
      hook: string;
      content: string;
      cta: string;
      tags: string[];
    };
  };
  
  // Step 4: Generation Progress
  generation?: {
    jobId?: string;
    status: "idle" | "queued" | "processing" | "completed" | "failed" | "cancelled";
    progress: number;
    estimatedCompletion?: number;
    errorMessage?: string;
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
  };
  
  // Step 5: Preview & Edit
  preview?: {
    videoUrl?: string;
    thumbnailUrl?: string;
    title: string;
    description?: string;
    tags: string[];
    isPublic: boolean;
    downloadRequested: boolean;
  };
  
  // Metadata
  createdAt: number;
  updatedAt: number;
  userId?: string;
  sessionId: string;
}

export interface WizardConfig {
  id: string;
  title: string;
  description?: string;
  steps: WizardStep[];
  allowSkipSteps?: boolean;
  allowBackNavigation?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number;
  persistToStorage?: boolean;
  storageKey?: string;
  onComplete?: (data: WizardData) => void | Promise<void>;
  onCancel?: (data: WizardData) => void;
  onStepChange?: (stepIndex: number, stepId: string, data: WizardData) => void;
  onDataChange?: (data: WizardData) => void;
  onError?: (error: Error, stepIndex: number) => void;
}

export interface WizardState {
  currentStepIndex: number;
  currentStepId: string;
  totalSteps: number;
  data: WizardData;
  isCompleted: boolean;
  isLoading: boolean;
  error: string | null;
  history: Array<{
    stepIndex: number;
    stepId: string;
    timestamp: number;
    data: Partial<WizardData>;
  }>;
}

export interface WizardActions {
  goToStep: (stepIndex: number) => void;
  goToStepById: (stepId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: () => void;
  updateStepData: (stepId: string, data: Record<string, any>) => void;
  setWizardData: (data: Partial<WizardData>) => void;
  resetWizard: () => void;
  completeWizard: () => void;
  cancelWizard: () => void;
  saveProgress: () => void;
  loadProgress: (sessionId?: string) => void;
  validateStep: (stepIndex?: number) => boolean;
  canProceedToStep: (stepIndex: number) => boolean;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export type WizardStore = WizardState & WizardActions;

// Preset configurations for common video types
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  preview?: string;
  style: WizardData["videoStyle"]["style"];
  tone: WizardData["videoStyle"]["tone"];
  visualStyle: WizardData["videoStyle"]["visualStyle"];
  targetPlatform: WizardData["videoStyle"]["targetPlatform"];
  duration: number;
  tags: string[];
  popularFor: string[];
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "tiktok-viral",
    name: "TikTok Viral",
    description: "High-energy, engaging content optimized for TikTok's algorithm",
    style: "entertaining",
    tone: "casual",
    visualStyle: "realistic",
    targetPlatform: "tiktok",
    duration: 15,
    tags: ["viral", "trending", "fyp", "entertainment"],
    popularFor: ["Trends", "Entertainment", "Lifestyle", "Dance"],
  },
  {
    id: "youtube-educational",
    name: "YouTube Educational",
    description: "Professional, informative content perfect for YouTube tutorials",
    style: "educational",
    tone: "professional",
    visualStyle: "realistic",
    targetPlatform: "youtube",
    duration: 30,
    tags: ["educational", "tutorial", "learning", "professional"],
    popularFor: ["Technology", "Science", "Business", "How-to"],
  },
  {
    id: "instagram-aesthetic",
    name: "Instagram Aesthetic",
    description: "Visually stunning content designed for Instagram feeds",
    style: "cinematic",
    tone: "inspiring",
    visualStyle: "realistic",
    targetPlatform: "instagram",
    duration: 15,
    tags: ["aesthetic", "beautiful", "inspiring", "lifestyle"],
    popularFor: ["Lifestyle", "Fashion", "Travel", "Art"],
  },
  {
    id: "twitter-news",
    name: "Twitter News",
    description: "Quick, attention-grabbing content for news and current events",
    style: "dramatic",
    tone: "serious",
    visualStyle: "realistic",
    targetPlatform: "twitter",
    duration: 15,
    tags: ["news", "breaking", "current", "urgent"],
    popularFor: ["News", "Politics", "Breaking", "Updates"],
  },
  {
    id: "universal-cinematic",
    name: "Universal Cinematic",
    description: "High-quality cinematic content suitable for all platforms",
    style: "cinematic",
    tone: "professional",
    visualStyle: "realistic",
    targetPlatform: "youtube",
    duration: 20,
    tags: ["cinematic", "professional", "high-quality", "universal"],
    popularFor: ["Business", "Presentations", "Products", "Brand"],
  },
  {
    id: "minimalist-clean",
    name: "Minimalist Clean",
    description: "Clean, simple design focused on clarity and message",
    style: "minimalist",
    tone: "professional",
    visualStyle: "abstract",
    targetPlatform: "youtube",
    duration: 20,
    tags: ["minimal", "clean", "simple", "focused"],
    popularFor: ["Business", "Explainer", "Product", "Tech"],
  },
];

// Validation rules for wizard steps
export interface ValidationRule {
  field: string;
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: any;
  message: string;
  validator?: (value: any, data: WizardData) => boolean;
}

export interface StepValidation {
  stepId: string;
  rules: ValidationRule[];
  isValid?: (data: WizardData) => boolean;
}

export const WIZARD_VALIDATIONS: StepValidation[] = [
  {
    stepId: "trend-selection",
    rules: [
      {
        field: "selectedTrend",
        type: "required",
        message: "Please select a trend to continue",
      },
    ],
  },
  {
    stepId: "style-configuration",
    rules: [
      {
        field: "videoStyle.style",
        type: "required",
        message: "Please select a video style",
      },
      {
        field: "videoStyle.duration",
        type: "min",
        value: 5,
        message: "Video duration must be at least 5 seconds",
      },
      {
        field: "videoStyle.duration",
        type: "max",
        value: 60,
        message: "Video duration cannot exceed 60 seconds",
      },
    ],
  },
  {
    stepId: "ai-configuration",
    rules: [
      {
        field: "aiSettings.provider",
        type: "required",
        message: "Please select an AI provider",
      },
    ],
    isValid: (data) => {
      if (data.aiSettings?.useCustomPrompt) {
        return !!data.aiSettings?.customPrompt?.trim();
      }
      return true;
    },
  },
];

// Step completion tracking
export interface StepCompletion {
  stepId: string;
  isCompleted: boolean;
  completedAt?: number;
  data?: Record<string, any>;
  validationErrors?: string[];
}