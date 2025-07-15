import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type WizardStep =
  | "trend-selection"
  | "style-configuration"
  | "script-generation"
  | "video-generation"
  | "preview-edit"
  | "complete";

export interface TrendSelection {
  trendId: string;
  title: string;
  description: string;
  viralScore: number;
  platform: string;
  category: string;
}

export interface VideoStyle {
  preset: string;
  duration: number; // in seconds (15, 30, 60)
  aspectRatio: "9:16" | "16:9" | "1:1";
  voiceType: "male" | "female" | "ai-generated";
  musicGenre?: string;
  includeSubtitles: boolean;
  visualStyle: "realistic" | "animated" | "mixed";
}

export interface GeneratedScript {
  hook: string;
  mainContent: string;
  callToAction: string;
  scenes: ScriptScene[];
  estimatedDuration: number;
}

export interface ScriptScene {
  id: string;
  text: string;
  duration: number;
  visualPrompt: string;
  order: number;
}

export interface VideoGenerationJob {
  jobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  progress: number;
  provider: "veo" | "runway" | "luma";
  estimatedCompletion?: number;
  errorMessage?: string;
}

export interface GeneratedVideo {
  videoId: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  quality: string;
  fileSize: number;
}

export interface VideoWizardState {
  // Current wizard state
  currentStep: WizardStep;
  isWizardOpen: boolean;
  canNavigateBack: boolean;
  canNavigateForward: boolean;

  // Step data
  selectedTrend: TrendSelection | null;
  videoStyle: VideoStyle;
  generatedScript: GeneratedScript | null;
  generationJob: VideoGenerationJob | null;
  generatedVideo: GeneratedVideo | null;

  // Validation state
  stepValidation: Record<WizardStep, boolean>;

  // Actions
  openWizard: () => void;
  closeWizard: () => void;
  resetWizard: () => void;

  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  previousStep: () => void;

  setTrendSelection: (trend: TrendSelection) => void;
  setVideoStyle: (style: Partial<VideoStyle>) => void;
  setGeneratedScript: (script: GeneratedScript) => void;
  setGenerationJob: (job: VideoGenerationJob) => void;
  updateJobProgress: (
    progress: number,
    status?: VideoGenerationJob["status"]
  ) => void;
  setGeneratedVideo: (video: GeneratedVideo) => void;

  validateStep: (step: WizardStep) => boolean;
  updateValidation: () => void;
}

const defaultVideoStyle: VideoStyle = {
  preset: "viral-short",
  duration: 30,
  aspectRatio: "9:16",
  voiceType: "ai-generated",
  includeSubtitles: true,
  visualStyle: "realistic",
};

const stepOrder: WizardStep[] = [
  "trend-selection",
  "style-configuration",
  "script-generation",
  "video-generation",
  "preview-edit",
  "complete",
];

export const useVideoWizardStore = create<VideoWizardState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state
        currentStep: "trend-selection",
        isWizardOpen: false,
        canNavigateBack: false,
        canNavigateForward: false,

        selectedTrend: null,
        videoStyle: defaultVideoStyle,
        generatedScript: null,
        generationJob: null,
        generatedVideo: null,

        stepValidation: {
          "trend-selection": false,
          "style-configuration": true, // Has defaults
          "script-generation": false,
          "video-generation": false,
          "preview-edit": false,
          complete: false,
        },

        // Wizard management
        openWizard: () => {
          set((state) => {
            state.isWizardOpen = true;
            state.currentStep = "trend-selection";
          });
          get().updateValidation();
        },

        closeWizard: () => {
          set((state) => {
            state.isWizardOpen = false;
          });
        },

        resetWizard: () => {
          set((state) => {
            state.currentStep = "trend-selection";
            state.selectedTrend = null;
            state.videoStyle = defaultVideoStyle;
            state.generatedScript = null;
            state.generationJob = null;
            state.generatedVideo = null;
            state.stepValidation = {
              "trend-selection": false,
              "style-configuration": true,
              "script-generation": false,
              "video-generation": false,
              "preview-edit": false,
              complete: false,
            };
          });
          get().updateValidation();
        },

        // Step navigation
        goToStep: (step) => {
          set((state) => {
            state.currentStep = step;
          });
          get().updateValidation();
        },

        nextStep: () => {
          const currentIndex = stepOrder.indexOf(get().currentStep);
          if (currentIndex < stepOrder.length - 1) {
            const nextStep = stepOrder[currentIndex + 1];
            get().goToStep(nextStep);
          }
        },

        previousStep: () => {
          const currentIndex = stepOrder.indexOf(get().currentStep);
          if (currentIndex > 0) {
            const prevStep = stepOrder[currentIndex - 1];
            get().goToStep(prevStep);
          }
        },

        // Data setters
        setTrendSelection: (trend) => {
          set((state) => {
            state.selectedTrend = trend;
            state.stepValidation["trend-selection"] = true;
          });
          get().updateValidation();
        },

        setVideoStyle: (styleUpdate) => {
          set((state) => {
            Object.assign(state.videoStyle, styleUpdate);
            state.stepValidation["style-configuration"] = true;
          });
          get().updateValidation();
        },

        setGeneratedScript: (script) => {
          set((state) => {
            state.generatedScript = script;
            state.stepValidation["script-generation"] = true;
          });
          get().updateValidation();
        },

        setGenerationJob: (job) => {
          set((state) => {
            state.generationJob = job;
          });
        },

        updateJobProgress: (progress, status) => {
          set((state) => {
            if (state.generationJob) {
              state.generationJob.progress = progress;
              if (status) {
                state.generationJob.status = status;
              }

              if (status === "completed") {
                state.stepValidation["video-generation"] = true;
              }
            }
          });
          get().updateValidation();
        },

        setGeneratedVideo: (video) => {
          set((state) => {
            state.generatedVideo = video;
            state.stepValidation["preview-edit"] = true;
            state.stepValidation["complete"] = true;
          });
          get().updateValidation();
        },

        // Validation
        validateStep: (step) => {
          const state = get();

          switch (step) {
            case "trend-selection":
              return state.selectedTrend !== null;
            case "style-configuration":
              return (
                state.videoStyle.preset !== "" && state.videoStyle.duration > 0
              );
            case "script-generation":
              return state.generatedScript !== null;
            case "video-generation":
              return state.generationJob?.status === "completed";
            case "preview-edit":
              return state.generatedVideo !== null;
            case "complete":
              return state.generatedVideo !== null;
            default:
              return false;
          }
        },

        updateValidation: () => {
          set((state) => {
            const currentIndex = stepOrder.indexOf(state.currentStep);

            // Update all step validations
            stepOrder.forEach((step) => {
              state.stepValidation[step] = get().validateStep(step);
            });

            // Update navigation capabilities
            state.canNavigateBack = currentIndex > 0;
            state.canNavigateForward =
              currentIndex < stepOrder.length - 1 &&
              state.stepValidation[state.currentStep];
          });
        },
      })),
      {
        name: "video-wizard-store",
        // Only persist key data, not UI state
        partialize: (state) => ({
          selectedTrend: state.selectedTrend,
          videoStyle: state.videoStyle,
          generatedScript: state.generatedScript,
          generatedVideo: state.generatedVideo,
        }),
      }
    ),
    {
      name: "video-wizard-store",
    }
  )
);

// Selectors for specific use cases
export const useWizardNavigation = () =>
  useVideoWizardStore((state) => ({
    currentStep: state.currentStep,
    canNavigateBack: state.canNavigateBack,
    canNavigateForward: state.canNavigateForward,
    goToStep: state.goToStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
  }));

export const useWizardData = () =>
  useVideoWizardStore((state) => ({
    selectedTrend: state.selectedTrend,
    videoStyle: state.videoStyle,
    generatedScript: state.generatedScript,
    generationJob: state.generationJob,
    generatedVideo: state.generatedVideo,
  }));

export const useWizardActions = () =>
  useVideoWizardStore((state) => ({
    openWizard: state.openWizard,
    closeWizard: state.closeWizard,
    resetWizard: state.resetWizard,
    setTrendSelection: state.setTrendSelection,
    setVideoStyle: state.setVideoStyle,
    setGeneratedScript: state.setGeneratedScript,
    setGenerationJob: state.setGenerationJob,
    updateJobProgress: state.updateJobProgress,
    setGeneratedVideo: state.setGeneratedVideo,
  }));

export const useCurrentStepData = () =>
  useVideoWizardStore((state) => {
    switch (state.currentStep) {
      case "trend-selection":
        return { selectedTrend: state.selectedTrend };
      case "style-configuration":
        return { videoStyle: state.videoStyle };
      case "script-generation":
        return {
          selectedTrend: state.selectedTrend,
          videoStyle: state.videoStyle,
          generatedScript: state.generatedScript,
        };
      case "video-generation":
        return { generationJob: state.generationJob };
      case "preview-edit":
      case "complete":
        return { generatedVideo: state.generatedVideo };
      default:
        return {};
    }
  });
