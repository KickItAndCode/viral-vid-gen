import { useEffect, useRef } from "react";
import {
  useUIStore,
  useVideoWizardStore,
  usePreferencesStore,
} from "./index";

// Generic subscription utility
export function useStoreSubscription<T>(
  store: any,
  selector: (state: any) => T,
  callback: (value: T, previousValue: T) => void
) {
  const previousValueRef = useRef<T>();

  useEffect(() => {
    const unsubscribe = store.subscribe((state: any) => {
      const currentValue = selector(state);
      const previousValue = previousValueRef.current;

      if (currentValue !== previousValue) {
        callback(currentValue, previousValue as T);
        previousValueRef.current = currentValue;
      }
    });

    // Set initial value
    previousValueRef.current = selector(store.getState());

    return unsubscribe;
  }, [store, selector, callback]);
}

// Theme synchronization between UI store and preferences
export function useThemeSync() {
  useEffect(() => {
    // Sync theme changes from preferences to UI store
    const unsubscribePrefs = usePreferencesStore.subscribe((state) => {
      const theme = state.ui.theme;
      const currentUITheme = useUIStore.getState().theme;

      if (theme !== currentUITheme) {
        useUIStore.getState().setTheme(theme);
      }
    });

    // Sync theme changes from UI store to preferences
    const unsubscribeUI = useUIStore.subscribe((state) => {
      const theme = state.theme;
      const currentPrefTheme = usePreferencesStore.getState().ui.theme;

      if (theme !== currentPrefTheme) {
        usePreferencesStore.getState().updateUIPreferences({ theme });
      }
    });

    return () => {
      unsubscribePrefs();
      unsubscribeUI();
    };
  }, []);
}

// Auto-save for video wizard
export function useWizardAutoSave() {
  const autoSaveEnabled = usePreferencesStore((state) => state.video.autoSave);

  useEffect(() => {
    if (!autoSaveEnabled) return;

    const unsubscribe = useVideoWizardStore.subscribe((state) => {
      // Auto-save wizard state to localStorage (already handled by persist middleware)
      // This could trigger additional saves to server, etc.
      console.debug("Video wizard state auto-saved:", {
        step: state.currentStep,
        hasSelection: !!state.selectedTrend,
        hasScript: !!state.generatedScript,
      });
    });

    return unsubscribe;
  }, [autoSaveEnabled]);
}


// Notification management with auto-cleanup
export function useNotificationAutoCleanup() {
  useEffect(() => {
    const unsubscribe = useUIStore.subscribe((state) => {
      const notifications = state.notifications;
      const now = Date.now();

      // Clean up old notifications (older than 1 minute)
      notifications.forEach((notification) => {
        if (notification.duration && notification.duration > 0) {
          const ageMs = now - notification.timestamp;
          if (ageMs > notification.duration + 60000) {
            // Extra 1 minute buffer
            state.removeNotification(notification.id);
          }
        }
      });
    });

    return unsubscribe;
  }, []);
}

// Local storage sync for preferences
export function usePreferencesSync() {
  useEffect(() => {
    // Check if we need to sync with server periodically
    const unsubscribe = usePreferencesStore.subscribe((state) => {
      const lastSync = state.lastSync;
      const now = Date.now();

      // Sync every 5 minutes if user is authenticated
      if (state.userId && (!lastSync || now - lastSync > 300000)) {
        state.syncWithServer();
      }
    });

    return unsubscribe;
  }, []);
}

// Keyboard shortcut manager
export function useKeyboardShortcuts() {
  const shortcuts = usePreferencesStore((state) => state.shortcuts);
  const wizardActions = useVideoWizardStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const ctrlKey = event.ctrlKey || event.metaKey;
      const altKey = event.altKey;
      const shiftKey = event.shiftKey;

      // Build key combination string
      let combination = "";
      if (ctrlKey) combination += "Ctrl+";
      if (altKey) combination += "Alt+";
      if (shiftKey) combination += "Shift+";
      combination += key;

      // Check for matches and execute actions
      Object.entries(shortcuts).forEach(([action, shortcut]) => {
        if (shortcut === combination || shortcut === key) {
          event.preventDefault();

          switch (action) {
            // Add shortcut actions as needed
          }
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, wizardActions]);
}

// Performance monitoring for store updates
export function useStorePerformanceMonitoring() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const stores = {
      ui: useUIStore,
      wizard: useVideoWizardStore,
      preferences: usePreferencesStore,
    };

    const unsubscribers: (() => void)[] = [];

    Object.entries(stores).forEach(([name, store]) => {
      const unsubscribe = store.subscribe(() => {
        console.debug(
          `🏪 ${name} store updated at ${new Date().toISOString()}`
        );
      });
      unsubscribers.push(unsubscribe);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
}

// Cross-store state validation
export function useStoreValidation() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const validateStores = () => {
      const ui = useUIStore.getState();
      const preferences = usePreferencesStore.getState();
      const wizard = useVideoWizardStore.getState();

      // Validate theme consistency
      if (ui.theme !== preferences.ui.theme) {
        console.warn("Theme mismatch between UI store and preferences");
      }

      // Validate wizard state consistency
      if (
        wizard.isWizardOpen &&
        wizard.currentStep === "complete" &&
        !wizard.generatedVideo
      ) {
        console.warn("Wizard in complete state but no generated video");
      }

    };

    // Run validation periodically in development
    const interval = setInterval(validateStores, 5000);

    return () => clearInterval(interval);
  }, []);
}

// Master hook that sets up all subscriptions
export function useStoreSubscriptions() {
  useThemeSync();
  useWizardAutoSave();
  useNotificationAutoCleanup();
  usePreferencesSync();
  useKeyboardShortcuts();
  useStorePerformanceMonitoring();
  useStoreValidation();
}
