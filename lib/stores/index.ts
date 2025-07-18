// Store exports
export * from "./ui-store";
export * from "./video-wizard-store";
export * from "./preferences-store";

// Re-export commonly used hooks with cleaner names
export {
  useUIStore,
  useTheme,
  useSidebar,
  useModals,
  useNotifications,
  useLoading,
} from "./ui-store";

export {
  useVideoWizardStore,
  useWizardNavigation,
  useWizardData,
  useWizardActions,
  useCurrentStepData,
} from "./video-wizard-store";


export {
  usePreferencesStore,
  useVideoPreferences,
  useUIPreferences,
  useNotificationPreferences,
  useTrendPreferences,
  useExportPreferences,
  useKeyboardShortcuts,
  usePreferencesActions,
  useShortcut,
  useFeatureEnabled,
} from "./preferences-store";

// Store development utilities
import { useUIStore } from "./ui-store";
import { useVideoWizardStore } from "./video-wizard-store";
import { usePreferencesStore } from "./preferences-store";

export const getStoreSnapshot = () => {
  if (typeof window === "undefined") return null;

  return {
    ui: useUIStore.getState(),
    videoWizard: useVideoWizardStore.getState(),
    preferences: usePreferencesStore.getState(),
  };
};

export const logAllStores = () => {
  if (process.env.NODE_ENV !== "development") return;

  console.group("🏪 Store States");
  console.log("UI Store:", useUIStore.getState());
  console.log("Video Wizard Store:", useVideoWizardStore.getState());
  console.log("Preferences Store:", usePreferencesStore.getState());
  console.groupEnd();
};

// Development helper to reset all stores
export const resetAllStores = () => {
  if (process.env.NODE_ENV !== "development") {
    console.warn("resetAllStores is only available in development");
    return;
  }

  // Reset UI store
  useUIStore.setState({
    theme: "system",
    resolvedTheme: "dark",
    sidebarOpen: true,
    sidebarCollapsed: false,
    modals: [],
    notifications: [],
    globalLoading: false,
    loadingStates: {},
  });

  // Reset video wizard store
  useVideoWizardStore.getState().resetWizard();


  // Reset preferences store
  usePreferencesStore.getState().resetToDefaults();

  console.log("🔄 All stores have been reset to their initial state");
};

// Type exports for external use
export type {
  Theme,
  NotificationType,
  Notification,
  Modal,
  UIState,
} from "./ui-store";

export type {
  WizardStep,
  TrendSelection,
  VideoStyle,
  GeneratedScript,
  ScriptScene,
  VideoGenerationJob,
  GeneratedVideo,
  VideoWizardState,
} from "./video-wizard-store";


export type {
  VideoPreferences,
  EditorPreferences,
  UIPreferences,
  NotificationPreferences,
  TrendPreferences,
  ExportPreferences,
  KeyboardShortcuts,
  PreferencesState,
} from "./preferences-store";
