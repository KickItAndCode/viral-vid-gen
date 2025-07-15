import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface VideoPreferences {
  defaultDuration: number;
  defaultAspectRatio: "9:16" | "16:9" | "1:1";
  defaultQuality: "high" | "medium" | "low";
  autoSave: boolean;
  autoGenerate: boolean;
  includeWatermark: boolean;
}

export interface EditorPreferences {
  timelineZoom: number;
  showWaveforms: boolean;
  snapToGrid: boolean;
  autoPlay: boolean;
  keyframeInterval: number;
  undoLimit: number;
}

export interface UIPreferences {
  theme: "light" | "dark" | "system";
  sidebarCollapsed: boolean;
  showTooltips: boolean;
  animationsEnabled: boolean;
  compactMode: boolean;
  language: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  videoCompleted: boolean;
  trendUpdates: boolean;
  systemUpdates: boolean;
  marketing: boolean;
}

export interface TrendPreferences {
  preferredPlatforms: string[];
  preferredCategories: string[];
  minimumViralScore: number;
  updateFrequency: "realtime" | "hourly" | "daily";
  autoRefresh: boolean;
}

export interface ExportPreferences {
  defaultFormat: "mp4" | "mov" | "webm";
  defaultResolution: "1080p" | "720p" | "480p";
  defaultFps: 24 | 30 | 60;
  compressionLevel: "none" | "low" | "medium" | "high";
  includeCaptions: boolean;
}

export interface KeyboardShortcuts {
  playPause: string;
  stop: string;
  seekForward: string;
  seekBackward: string;
  volumeUp: string;
  volumeDown: string;
  toggleMute: string;
  undo: string;
  redo: string;
  save: string;
  export: string;
  fullscreen: string;
}

export interface PreferencesState {
  // Preference categories
  video: VideoPreferences;
  editor: EditorPreferences;
  ui: UIPreferences;
  notifications: NotificationPreferences;
  trends: TrendPreferences;
  export: ExportPreferences;
  shortcuts: KeyboardShortcuts;

  // User data
  userId?: string;
  lastSync?: number;

  // Actions
  updateVideoPreferences: (preferences: Partial<VideoPreferences>) => void;
  updateEditorPreferences: (preferences: Partial<EditorPreferences>) => void;
  updateUIPreferences: (preferences: Partial<UIPreferences>) => void;
  updateNotificationPreferences: (
    preferences: Partial<NotificationPreferences>
  ) => void;
  updateTrendPreferences: (preferences: Partial<TrendPreferences>) => void;
  updateExportPreferences: (preferences: Partial<ExportPreferences>) => void;
  updateKeyboardShortcuts: (shortcuts: Partial<KeyboardShortcuts>) => void;

  resetToDefaults: (
    category?: keyof Pick<
      PreferencesState,
      | "video"
      | "editor"
      | "ui"
      | "notifications"
      | "trends"
      | "export"
      | "shortcuts"
    >
  ) => void;
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
  syncWithServer: () => Promise<void>;
}

const defaultVideoPreferences: VideoPreferences = {
  defaultDuration: 30,
  defaultAspectRatio: "9:16",
  defaultQuality: "high",
  autoSave: true,
  autoGenerate: false,
  includeWatermark: false,
};

const defaultEditorPreferences: EditorPreferences = {
  timelineZoom: 1,
  showWaveforms: true,
  snapToGrid: true,
  autoPlay: false,
  keyframeInterval: 1,
  undoLimit: 50,
};

const defaultUIPreferences: UIPreferences = {
  theme: "system",
  sidebarCollapsed: false,
  showTooltips: true,
  animationsEnabled: true,
  compactMode: false,
  language: "en",
};

const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  videoCompleted: true,
  trendUpdates: true,
  systemUpdates: true,
  marketing: false,
};

const defaultTrendPreferences: TrendPreferences = {
  preferredPlatforms: ["tiktok", "instagram", "youtube"],
  preferredCategories: ["entertainment", "lifestyle", "technology"],
  minimumViralScore: 70,
  updateFrequency: "hourly",
  autoRefresh: true,
};

const defaultExportPreferences: ExportPreferences = {
  defaultFormat: "mp4",
  defaultResolution: "1080p",
  defaultFps: 30,
  compressionLevel: "medium",
  includeCaptions: true,
};

const defaultKeyboardShortcuts: KeyboardShortcuts = {
  playPause: "Space",
  stop: "Escape",
  seekForward: "ArrowRight",
  seekBackward: "ArrowLeft",
  volumeUp: "ArrowUp",
  volumeDown: "ArrowDown",
  toggleMute: "M",
  undo: "Ctrl+Z",
  redo: "Ctrl+Y",
  save: "Ctrl+S",
  export: "Ctrl+E",
  fullscreen: "F",
};

export const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      immer((set, get) => ({
        // Initial state with defaults
        video: defaultVideoPreferences,
        editor: defaultEditorPreferences,
        ui: defaultUIPreferences,
        notifications: defaultNotificationPreferences,
        trends: defaultTrendPreferences,
        export: defaultExportPreferences,
        shortcuts: defaultKeyboardShortcuts,

        // Update actions
        updateVideoPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.video, preferences);
          });
        },

        updateEditorPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.editor, preferences);
          });
        },

        updateUIPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.ui, preferences);
          });
        },

        updateNotificationPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.notifications, preferences);
          });
        },

        updateTrendPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.trends, preferences);
          });
        },

        updateExportPreferences: (preferences) => {
          set((state) => {
            Object.assign(state.export, preferences);
          });
        },

        updateKeyboardShortcuts: (shortcuts) => {
          set((state) => {
            Object.assign(state.shortcuts, shortcuts);
          });
        },

        // Reset actions
        resetToDefaults: (category) => {
          set((state) => {
            if (category) {
              switch (category) {
                case "video":
                  state.video = { ...defaultVideoPreferences };
                  break;
                case "editor":
                  state.editor = { ...defaultEditorPreferences };
                  break;
                case "ui":
                  state.ui = { ...defaultUIPreferences };
                  break;
                case "notifications":
                  state.notifications = { ...defaultNotificationPreferences };
                  break;
                case "trends":
                  state.trends = { ...defaultTrendPreferences };
                  break;
                case "export":
                  state.export = { ...defaultExportPreferences };
                  break;
                case "shortcuts":
                  state.shortcuts = { ...defaultKeyboardShortcuts };
                  break;
              }
            } else {
              // Reset all
              state.video = { ...defaultVideoPreferences };
              state.editor = { ...defaultEditorPreferences };
              state.ui = { ...defaultUIPreferences };
              state.notifications = { ...defaultNotificationPreferences };
              state.trends = { ...defaultTrendPreferences };
              state.export = { ...defaultExportPreferences };
              state.shortcuts = { ...defaultKeyboardShortcuts };
            }
          });
        },

        // Import/Export actions
        exportPreferences: () => {
          const state = get();
          const exportData = {
            video: state.video,
            editor: state.editor,
            ui: state.ui,
            notifications: state.notifications,
            trends: state.trends,
            export: state.export,
            shortcuts: state.shortcuts,
            exportedAt: new Date().toISOString(),
            version: "1.0",
          };

          return JSON.stringify(exportData, null, 2);
        },

        importPreferences: (data) => {
          try {
            const parsed = JSON.parse(data);

            // Validate structure
            if (!parsed || typeof parsed !== "object") {
              return false;
            }

            set((state) => {
              // Only import valid preferences
              if (parsed.video && typeof parsed.video === "object") {
                Object.assign(state.video, parsed.video);
              }
              if (parsed.editor && typeof parsed.editor === "object") {
                Object.assign(state.editor, parsed.editor);
              }
              if (parsed.ui && typeof parsed.ui === "object") {
                Object.assign(state.ui, parsed.ui);
              }
              if (
                parsed.notifications &&
                typeof parsed.notifications === "object"
              ) {
                Object.assign(state.notifications, parsed.notifications);
              }
              if (parsed.trends && typeof parsed.trends === "object") {
                Object.assign(state.trends, parsed.trends);
              }
              if (parsed.export && typeof parsed.export === "object") {
                Object.assign(state.export, parsed.export);
              }
              if (parsed.shortcuts && typeof parsed.shortcuts === "object") {
                Object.assign(state.shortcuts, parsed.shortcuts);
              }
            });

            return true;
          } catch (error) {
            console.error("Failed to import preferences:", error);
            return false;
          }
        },

        // Sync action (placeholder for future server sync)
        syncWithServer: async () => {
          const state = get();

          if (!state.userId) {
            return;
          }

          try {
            // This would sync with a server in a real implementation
            // For now, just update the last sync timestamp
            set((draft) => {
              draft.lastSync = Date.now();
            });
          } catch (error) {
            console.error("Failed to sync preferences with server:", error);
          }
        },
      })),
      {
        name: "user-preferences",
        // Persist everything except temporary data
        partialize: (state) => ({
          video: state.video,
          editor: state.editor,
          ui: state.ui,
          notifications: state.notifications,
          trends: state.trends,
          export: state.export,
          shortcuts: state.shortcuts,
          userId: state.userId,
          lastSync: state.lastSync,
        }),
      }
    ),
    {
      name: "preferences-store",
    }
  )
);

// Selectors for specific preference categories
export const useVideoPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.video,
    updatePreferences: state.updateVideoPreferences,
  }));

export const useEditorPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.editor,
    updatePreferences: state.updateEditorPreferences,
  }));

export const useUIPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.ui,
    updatePreferences: state.updateUIPreferences,
  }));

export const useNotificationPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.notifications,
    updatePreferences: state.updateNotificationPreferences,
  }));

export const useTrendPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.trends,
    updatePreferences: state.updateTrendPreferences,
  }));

export const useExportPreferences = () =>
  usePreferencesStore((state) => ({
    preferences: state.export,
    updatePreferences: state.updateExportPreferences,
  }));

export const useKeyboardShortcuts = () =>
  usePreferencesStore((state) => ({
    shortcuts: state.shortcuts,
    updateShortcuts: state.updateKeyboardShortcuts,
  }));

export const usePreferencesActions = () =>
  usePreferencesStore((state) => ({
    resetToDefaults: state.resetToDefaults,
    exportPreferences: state.exportPreferences,
    importPreferences: state.importPreferences,
    syncWithServer: state.syncWithServer,
    lastSync: state.lastSync,
  }));

// Helper hook for getting specific shortcut
export const useShortcut = (action: keyof KeyboardShortcuts) => {
  return usePreferencesStore((state) => state.shortcuts[action]);
};

// Helper hook for checking if feature is enabled
export const useFeatureEnabled = (feature: string) => {
  return usePreferencesStore((state) => {
    switch (feature) {
      case "autoSave":
        return state.video.autoSave;
      case "autoGenerate":
        return state.video.autoGenerate;
      case "showWaveforms":
        return state.editor.showWaveforms;
      case "snapToGrid":
        return state.editor.snapToGrid;
      case "autoPlay":
        return state.editor.autoPlay;
      case "showTooltips":
        return state.ui.showTooltips;
      case "animationsEnabled":
        return state.ui.animationsEnabled;
      case "autoRefresh":
        return state.trends.autoRefresh;
      default:
        return false;
    }
  });
};
