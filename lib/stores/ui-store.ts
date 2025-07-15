import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type Theme = "light" | "dark" | "system";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

export interface Modal {
  id: string;
  type: string;
  data?: any;
  isOpen: boolean;
}

export interface UIState {
  // Theme management
  theme: Theme;
  resolvedTheme: "light" | "dark";

  // Sidebar state
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Modal management
  modals: Modal[];

  // Notification system
  notifications: Notification[];

  // Loading states
  globalLoading: boolean;
  loadingStates: Record<string, boolean>;

  // Actions
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: "light" | "dark") => void;

  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  openModal: (type: string, data?: any) => string;
  closeModal: (id: string) => void;
  closeAllModals: () => void;

  addNotification: (
    notification: Omit<Notification, "id" | "timestamp">
  ) => string;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;

  setGlobalLoading: (loading: boolean) => void;
  setLoading: (key: string, loading: boolean) => void;
  getLoading: (key: string) => boolean;
}

export const useUIStore = create<UIState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      theme: "system",
      resolvedTheme: "dark",
      sidebarOpen: false,
      sidebarCollapsed: false,
      modals: [],
      notifications: [],
      globalLoading: false,
      loadingStates: {},

      // Theme actions
      setTheme: (theme) => {
        set((state) => {
          state.theme = theme;
        });
      },

      setResolvedTheme: (theme) => {
        set((state) => {
          state.resolvedTheme = theme;
        });
      },

      // Sidebar actions
      toggleSidebar: () => {
        set((state) => {
          state.sidebarOpen = !state.sidebarOpen;
        });
      },

      openSidebar: () => {
        set((state) => {
          state.sidebarOpen = true;
        });
      },

      closeSidebar: () => {
        set((state) => {
          state.sidebarOpen = false;
        });
      },

      setSidebarOpen: (open) => {
        set((state) => {
          state.sidebarOpen = open;
        });
      },

      setSidebarCollapsed: (collapsed) => {
        set((state) => {
          state.sidebarCollapsed = collapsed;
        });
      },

      // Modal actions
      openModal: (type, data) => {
        const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => {
          state.modals.push({
            id,
            type,
            data,
            isOpen: true,
          });
        });

        return id;
      },

      closeModal: (id) => {
        set((state) => {
          const modal = state.modals.find((m) => m.id === id);
          if (modal) {
            modal.isOpen = false;
          }
        });

        // Remove modal after animation delay
        setTimeout(() => {
          set((state) => {
            state.modals = state.modals.filter((m) => m.id !== id);
          });
        }, 300);
      },

      closeAllModals: () => {
        set((state) => {
          state.modals.forEach((modal) => {
            modal.isOpen = false;
          });
        });

        // Remove all modals after animation delay
        setTimeout(() => {
          set((state) => {
            state.modals = [];
          });
        }, 300);
      },

      // Notification actions
      addNotification: (notification) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const timestamp = Date.now();
        const duration = notification.duration ?? 5000;

        set((state) => {
          state.notifications.push({
            ...notification,
            id,
            timestamp,
            duration,
          });
        });

        // Auto-remove notification after duration
        if (duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, duration);
        }

        return id;
      },

      removeNotification: (id) => {
        set((state) => {
          state.notifications = state.notifications.filter((n) => n.id !== id);
        });
      },

      clearNotifications: () => {
        set((state) => {
          state.notifications = [];
        });
      },

      // Loading actions
      setGlobalLoading: (loading) => {
        set((state) => {
          state.globalLoading = loading;
        });
      },

      setLoading: (key, loading) => {
        set((state) => {
          if (loading) {
            state.loadingStates[key] = true;
          } else {
            delete state.loadingStates[key];
          }
        });
      },

      getLoading: (key) => {
        return get().loadingStates[key] ?? false;
      },
    })),
    {
      name: "ui-store",
    }
  )
);

// Selectors for common use cases
export const useTheme = () =>
  useUIStore((state) => ({
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme: state.setTheme,
    setResolvedTheme: state.setResolvedTheme,
  }));

export const useSidebar = () =>
  useUIStore((state) => ({
    sidebarOpen: state.sidebarOpen,
    sidebarCollapsed: state.sidebarCollapsed,
    toggleSidebar: state.toggleSidebar,
    openSidebar: state.openSidebar,
    closeSidebar: state.closeSidebar,
    setSidebarOpen: state.setSidebarOpen,
    setSidebarCollapsed: state.setSidebarCollapsed,
  }));

export const useModals = () =>
  useUIStore((state) => ({
    modals: state.modals,
    openModal: state.openModal,
    closeModal: state.closeModal,
    closeAllModals: state.closeAllModals,
  }));

export const useNotifications = () =>
  useUIStore((state) => ({
    notifications: state.notifications,
    addNotification: state.addNotification,
    removeNotification: state.removeNotification,
    clearNotifications: state.clearNotifications,
  }));

export const useLoading = () =>
  useUIStore((state) => ({
    globalLoading: state.globalLoading,
    setGlobalLoading: state.setGlobalLoading,
    setLoading: state.setLoading,
    getLoading: state.getLoading,
  }));
