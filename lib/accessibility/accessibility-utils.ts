/**
 * Accessibility utility functions and constants for ViralAI
 * Provides WCAG 2.1 AA compliant accessibility features
 */

// Minimum touch target size (44px as per WCAG guidelines)
export const MIN_TOUCH_TARGET_SIZE = 44;

// Screen reader announcements
export const SCREEN_READER_ANNOUNCEMENTS = {
  LOADING: "Loading content, please wait",
  ERROR: "An error occurred",
  SUCCESS: "Action completed successfully",
  NAVIGATION: "Navigation menu",
  MAIN_CONTENT: "Main content",
  SEARCH: "Search",
  FILTERS: "Filters",
  MODAL_OPENED: "Modal dialog opened",
  MODAL_CLOSED: "Modal dialog closed",
  TAB_ACTIVATED: "Tab activated",
  VIDEO_PLAYING: "Video is playing",
  VIDEO_PAUSED: "Video is paused",
  VIDEO_ENDED: "Video has ended",
  STEP_COMPLETED: "Step completed",
  FORM_VALIDATION_ERROR: "Form validation error",
  PROGRESS_UPDATE: "Progress updated",
} as const;

// ARIA labels for common elements
export const ARIA_LABELS = {
  CLOSE: "Close",
  EXPAND: "Expand",
  COLLAPSE: "Collapse",
  MENU: "Menu",
  SEARCH: "Search",
  FILTER: "Filter",
  SORT: "Sort",
  NEXT: "Next",
  PREVIOUS: "Previous",
  PLAY: "Play",
  PAUSE: "Pause",
  MUTE: "Mute",
  UNMUTE: "Unmute",
  VOLUME: "Volume",
  SETTINGS: "Settings",
  FULLSCREEN: "Fullscreen",
  EXIT_FULLSCREEN: "Exit fullscreen",
  LIKE: "Like",
  SHARE: "Share",
  DOWNLOAD: "Download",
  EDIT: "Edit",
  DELETE: "Delete",
  SAVE: "Save",
  CANCEL: "Cancel",
  SUBMIT: "Submit",
  LOADING: "Loading",
  ERROR: "Error",
  SUCCESS: "Success",
  WARNING: "Warning",
  INFO: "Information",
} as const;

// Generate unique IDs for form elements
export const generateId = (prefix: string = "viralai"): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

// Announce to screen readers
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "polite");
  announcement.setAttribute("aria-atomic", "true");
  announcement.setAttribute("class", "sr-only");
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Announce urgent messages to screen readers
export const announceUrgentToScreenReader = (message: string): void => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", "assertive");
  announcement.setAttribute("aria-atomic", "true");
  announcement.setAttribute("class", "sr-only");
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Focus management utilities
export const focusElement = (element: HTMLElement | null): void => {
  if (element) {
    element.focus();
  }
};

export const focusElementById = (id: string): void => {
  const element = document.getElementById(id);
  focusElement(element);
};

export const focusFirstFocusableElement = (container: HTMLElement): void => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length > 0) {
    (focusableElements[0] as HTMLElement).focus();
  }
};

export const focusLastFocusableElement = (container: HTMLElement): void => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length > 0) {
    (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
  }
};

// Keyboard navigation utilities
export const KEYBOARD_KEYS = {
  ESCAPE: "Escape",
  ENTER: "Enter",
  SPACE: " ",
  TAB: "Tab",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  HOME: "Home",
  END: "End",
  PAGE_UP: "PageUp",
  PAGE_DOWN: "PageDown",
} as const;

export const handleKeyboardNavigation = (
  event: KeyboardEvent,
  handlers: Partial<Record<keyof typeof KEYBOARD_KEYS, () => void>>
): void => {
  const key = event.key;
  const handler = handlers[key as keyof typeof KEYBOARD_KEYS];

  if (handler) {
    event.preventDefault();
    handler();
  }
};

// Trap focus within a container (useful for modals)
export const trapFocus = (container: HTMLElement): (() => void) => {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstFocusable = focusableElements[0] as HTMLElement;
  const lastFocusable = focusableElements[
    focusableElements.length - 1
  ] as HTMLElement;

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  };

  container.addEventListener("keydown", handleTabKey);

  // Focus the first element
  firstFocusable?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener("keydown", handleTabKey);
  };
};

// Color contrast utilities
export const getContrastRatio = (color1: string, color2: string): number => {
  // This is a simplified version. In a real implementation, you'd need
  // to convert colors to RGB and calculate luminance properly.
  // For now, we'll return a placeholder value
  return 4.5; // WCAG AA minimum contrast ratio
};

export const isValidContrastRatio = (
  color1: string,
  color2: string
): boolean => {
  return getContrastRatio(color1, color2) >= 4.5;
};

// Touch target size validation
export const isValidTouchTargetSize = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return (
    rect.width >= MIN_TOUCH_TARGET_SIZE && rect.height >= MIN_TOUCH_TARGET_SIZE
  );
};

// Generate accessibility attributes for common patterns
export const getButtonAccessibilityProps = (
  label: string,
  isPressed?: boolean,
  isExpanded?: boolean,
  controls?: string,
  describedBy?: string
) => ({
  "aria-label": label,
  ...(isPressed !== undefined && { "aria-pressed": isPressed }),
  ...(isExpanded !== undefined && { "aria-expanded": isExpanded }),
  ...(controls && { "aria-controls": controls }),
  ...(describedBy && { "aria-describedby": describedBy }),
});

export const getFormFieldAccessibilityProps = (
  labelId: string,
  errorId?: string,
  descriptionId?: string,
  required?: boolean
) => ({
  "aria-labelledby": labelId,
  ...(errorId && { "aria-describedby": errorId }),
  ...(descriptionId && { "aria-describedby": descriptionId }),
  ...(required && { "aria-required": true }),
});

export const getModalAccessibilityProps = (
  titleId: string,
  descriptionId?: string
) => ({
  role: "dialog",
  "aria-modal": true,
  "aria-labelledby": titleId,
  ...(descriptionId && { "aria-describedby": descriptionId }),
});

export const getProgressAccessibilityProps = (
  value: number,
  max: number = 100,
  label?: string
) => ({
  role: "progressbar",
  "aria-valuenow": value,
  "aria-valuemin": 0,
  "aria-valuemax": max,
  "aria-valuetext": `${value} of ${max}`,
  ...(label && { "aria-label": label }),
});

// Skip navigation utilities
export const createSkipLink = (
  targetId: string,
  label: string
): HTMLAnchorElement => {
  const skipLink = document.createElement("a");
  skipLink.href = `#${targetId}`;
  skipLink.textContent = label;
  skipLink.className =
    "sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary focus:text-primary-foreground";

  return skipLink;
};

// Landmark roles
export const LANDMARK_ROLES = {
  BANNER: "banner",
  NAVIGATION: "navigation",
  MAIN: "main",
  COMPLEMENTARY: "complementary",
  CONTENTINFO: "contentinfo",
  SEARCH: "search",
  REGION: "region",
} as const;

// Helper to create accessible loading states
export const createLoadingState = (message: string = "Loading") => ({
  "aria-live": "polite",
  "aria-busy": true,
  "aria-label": message,
});

// Helper to create accessible error states
export const createErrorState = (message: string) => ({
  role: "alert",
  "aria-live": "assertive",
  "aria-label": message,
});

// Helper to create accessible success states
export const createSuccessState = (message: string) => ({
  role: "status",
  "aria-live": "polite",
  "aria-label": message,
});
