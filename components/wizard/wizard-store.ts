import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import {
  WizardStore,
  WizardData,
  WizardConfig,
  ValidationRule,
  WIZARD_VALIDATIONS,
} from "./types";

// Default wizard data
const createDefaultWizardData = (): WizardData => ({
  createdAt: Date.now(),
  updatedAt: Date.now(),
  sessionId: `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
});

// Validation helper
const validateStepData = (
  stepId: string,
  data: WizardData
): { isValid: boolean; errors: string[] } => {
  const stepValidation = WIZARD_VALIDATIONS.find((v) => v.stepId === stepId);
  if (!stepValidation) return { isValid: true, errors: [] };

  const errors: string[] = [];

  // Check individual field rules
  for (const rule of stepValidation.rules) {
    const fieldValue = getNestedValue(data, rule.field);

    switch (rule.type) {
      case "required":
        if (!fieldValue) {
          errors.push(rule.message);
        }
        break;
      case "min":
        if (typeof fieldValue === "number" && fieldValue < rule.value) {
          errors.push(rule.message);
        }
        break;
      case "max":
        if (typeof fieldValue === "number" && fieldValue > rule.value) {
          errors.push(rule.message);
        }
        break;
      case "pattern":
        if (
          typeof fieldValue === "string" &&
          !new RegExp(rule.value).test(fieldValue)
        ) {
          errors.push(rule.message);
        }
        break;
      case "custom":
        if (rule.validator && !rule.validator(fieldValue, data)) {
          errors.push(rule.message);
        }
        break;
    }
  }

  // Check custom validation function
  if (stepValidation.isValid && !stepValidation.isValid(data)) {
    if (stepId === "ai-configuration" && data.aiSettings?.useCustomPrompt) {
      errors.push("Custom prompt is required when using custom prompt option");
    }
  }

  return { isValid: errors.length === 0, errors };
};

// Helper to get nested object values
const getNestedValue = (obj: any, path: string): any => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

// Storage helpers
const STORAGE_KEY = "viralai_wizard_progress";

const saveToStorage = (data: WizardData) => {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}_${data.sessionId}`,
      JSON.stringify(data)
    );
  } catch (error) {
    console.warn("Failed to save wizard progress to storage:", error);
  }
};

const loadFromStorage = (sessionId: string): WizardData | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${sessionId}`);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to load wizard progress from storage:", error);
    return null;
  }
};

const clearStorage = (sessionId: string) => {
  try {
    localStorage.removeItem(`${STORAGE_KEY}_${sessionId}`);
  } catch (error) {
    console.warn("Failed to clear wizard progress from storage:", error);
  }
};

export const useWizardStore = create<WizardStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    currentStepIndex: 0,
    currentStepId: "",
    totalSteps: 0,
    data: createDefaultWizardData(),
    isCompleted: false,
    isLoading: false,
    error: null,
    history: [],

    // Navigation actions
    goToStep: (stepIndex: number) => {
      const state = get();
      if (stepIndex < 0 || stepIndex >= state.totalSteps) return;

      set({
        currentStepIndex: stepIndex,
        currentStepId: state.currentStepId, // Will be updated by wizard component
        history: [
          ...state.history,
          {
            stepIndex: state.currentStepIndex,
            stepId: state.currentStepId,
            timestamp: Date.now(),
            data: { ...state.data },
          },
        ],
      });
    },

    goToStepById: (stepId: string) => {
      // This will be implemented by the wizard component since it knows the step mapping
      console.warn("goToStepById should be implemented by wizard component");
    },

    nextStep: () => {
      const state = get();
      if (state.currentStepIndex < state.totalSteps - 1) {
        get().goToStep(state.currentStepIndex + 1);
      }
    },

    previousStep: () => {
      const state = get();
      if (state.currentStepIndex > 0) {
        get().goToStep(state.currentStepIndex - 1);
      }
    },

    skipStep: () => {
      const state = get();
      if (state.currentStepIndex < state.totalSteps - 1) {
        get().goToStep(state.currentStepIndex + 1);
      }
    },

    // Data management
    updateStepData: (stepId: string, stepData: Record<string, any>) => {
      const state = get();
      const updatedData = {
        ...state.data,
        [stepId
          .replace("-", "")
          .replace("selection", "Selected")
          .replace("configuration", "Style")]: stepData,
        updatedAt: Date.now(),
      };

      // Handle specific step data mapping
      switch (stepId) {
        case "trend-selection":
          updatedData.selectedTrend = stepData.selectedTrend;
          break;
        case "style-configuration":
          updatedData.videoStyle = stepData.videoStyle;
          break;
        case "ai-configuration":
          updatedData.aiSettings = stepData.aiSettings;
          break;
        case "generation-progress":
          updatedData.generation = stepData.generation;
          break;
        case "preview-edit":
          updatedData.preview = stepData.preview;
          break;
        default:
          // Generic handling for custom steps
          Object.assign(updatedData, stepData);
      }

      set({ data: updatedData });

      // Auto-save to storage
      saveToStorage(updatedData);
    },

    setWizardData: (newData: Partial<WizardData>) => {
      const state = get();
      const updatedData = {
        ...state.data,
        ...newData,
        updatedAt: Date.now(),
      };

      set({ data: updatedData });
      saveToStorage(updatedData);
    },

    // Wizard lifecycle
    resetWizard: () => {
      const state = get();
      clearStorage(state.data.sessionId);

      set({
        currentStepIndex: 0,
        currentStepId: "",
        data: createDefaultWizardData(),
        isCompleted: false,
        isLoading: false,
        error: null,
        history: [],
      });
    },

    completeWizard: () => {
      const state = get();
      set({
        isCompleted: true,
        history: [
          ...state.history,
          {
            stepIndex: state.currentStepIndex,
            stepId: state.currentStepId,
            timestamp: Date.now(),
            data: { ...state.data },
          },
        ],
      });

      // Clear auto-save data since wizard is completed
      clearStorage(state.data.sessionId);
    },

    cancelWizard: () => {
      const state = get();
      clearStorage(state.data.sessionId);
      get().resetWizard();
    },

    // Storage operations
    saveProgress: () => {
      const state = get();
      saveToStorage(state.data);
    },

    loadProgress: (sessionId?: string) => {
      const targetSessionId = sessionId || get().data.sessionId;
      const savedData = loadFromStorage(targetSessionId);

      if (savedData) {
        set({
          data: savedData,
          currentStepIndex: 0, // Reset to beginning, user can navigate as needed
        });
      }
    },

    // Validation
    validateStep: (stepIndex?: number) => {
      const state = get();
      const targetIndex = stepIndex ?? state.currentStepIndex;

      // This requires the wizard component to provide step mapping
      // For now, return true
      return true;
    },

    canProceedToStep: (stepIndex: number) => {
      const state = get();

      // Can always go backwards
      if (stepIndex <= state.currentStepIndex) return true;

      // Can only proceed to next step if current step is valid
      if (stepIndex === state.currentStepIndex + 1) {
        return get().validateStep();
      }

      // Cannot skip multiple steps ahead
      return false;
    },

    // Error handling
    setError: (error: string | null) => {
      set({ error, isLoading: false });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },
  }))
);

// Helper hook for accessing specific wizard data
export const useWizardData = () => {
  return useWizardStore((state) => state.data);
};

// Helper hook for current step info
export const useCurrentStep = () => {
  return useWizardStore((state) => ({
    currentStepIndex: state.currentStepIndex,
    currentStepId: state.currentStepId,
    totalSteps: state.totalSteps,
    isFirstStep: state.currentStepIndex === 0,
    isLastStep: state.currentStepIndex === state.totalSteps - 1,
  }));
};

// Helper hook for navigation
export const useWizardNavigation = () => {
  return useWizardStore((state) => ({
    goToStep: state.goToStep,
    nextStep: state.nextStep,
    previousStep: state.previousStep,
    skipStep: state.skipStep,
    canProceedToStep: state.canProceedToStep,
  }));
};

// Helper hook for wizard status
export const useWizardStatus = () => {
  return useWizardStore((state) => ({
    isCompleted: state.isCompleted,
    isLoading: state.isLoading,
    error: state.error,
    setError: state.setError,
    setLoading: state.setLoading,
  }));
};

// Subscription helpers for external integrations
export const subscribeToWizardData = (callback: (data: WizardData) => void) => {
  return useWizardStore.subscribe((state) => state.data, callback, {
    fireImmediately: true,
  });
};

export const subscribeToStepChanges = (
  callback: (stepIndex: number, stepId: string) => void
) => {
  return useWizardStore.subscribe(
    (state) => ({
      stepIndex: state.currentStepIndex,
      stepId: state.currentStepId,
    }),
    ({ stepIndex, stepId }) => callback(stepIndex, stepId),
    { fireImmediately: true }
  );
};
