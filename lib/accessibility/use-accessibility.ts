import { useEffect, useRef, useState } from "react";
import {
  announceToScreenReader,
  announceUrgentToScreenReader,
  trapFocus,
  focusElement,
  handleKeyboardNavigation,
  KEYBOARD_KEYS,
  generateId,
} from "./accessibility-utils";

/**
 * Hook for managing focus trapping in modals and overlays
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (isActive && containerRef.current) {
      cleanupRef.current = trapFocus(containerRef.current);
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, [isActive]);

  return containerRef;
};

/**
 * Hook for managing screen reader announcements
 */
export const useScreenReader = () => {
  const announce = (message: string, urgent: boolean = false) => {
    if (urgent) {
      announceUrgentToScreenReader(message);
    } else {
      announceToScreenReader(message);
    }
  };

  return { announce };
};

/**
 * Hook for managing keyboard navigation
 */
export const useKeyboardNavigation = (
  handlers: Partial<Record<keyof typeof KEYBOARD_KEYS, () => void>>,
  isActive: boolean = true
) => {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyboardNavigation(event, handlers);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handlers, isActive]);
};

/**
 * Hook for managing focus restoration (useful for modals)
 */
export const useFocusRestore = () => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  };

  const restoreFocus = () => {
    if (previousFocusRef.current) {
      focusElement(previousFocusRef.current);
      previousFocusRef.current = null;
    }
  };

  return { saveFocus, restoreFocus };
};

/**
 * Hook for generating unique IDs for form elements
 */
export const useAccessibleId = (prefix: string = "viralai") => {
  const [id] = useState(() => generateId(prefix));
  return id;
};

/**
 * Hook for managing aria-live regions
 */
export const useAriaLive = (initialMessage: string = "") => {
  const [message, setMessage] = useState(initialMessage);
  const [politeness, setPoliteness] = useState<"polite" | "assertive">(
    "polite"
  );

  const announce = (newMessage: string, urgent: boolean = false) => {
    setMessage(newMessage);
    setPoliteness(urgent ? "assertive" : "polite");
  };

  const clear = () => {
    setMessage("");
  };

  return {
    message,
    politeness,
    announce,
    clear,
    ariaLiveProps: {
      "aria-live": politeness,
      "aria-atomic": true,
      className: "sr-only",
    },
  };
};

/**
 * Hook for managing accessible form validation
 */
export const useAccessibleForm = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const setFieldError = (fieldName: string, error: string) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  };

  const clearFieldError = (fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const setFieldTouched = (fieldName: string, touched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [fieldName]: touched }));
  };

  const getFieldProps = (fieldName: string) => {
    const hasError = errors[fieldName] && touched[fieldName];
    const errorId = hasError ? `${fieldName}-error` : undefined;

    return {
      "aria-invalid": hasError,
      "aria-describedby": errorId,
      onBlur: () => setFieldTouched(fieldName, true),
    };
  };

  const getErrorProps = (fieldName: string) => {
    const hasError = errors[fieldName] && touched[fieldName];

    return {
      id: `${fieldName}-error`,
      role: "alert",
      "aria-live": "assertive",
      style: { display: hasError ? "block" : "none" },
    };
  };

  return {
    errors,
    touched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    getFieldProps,
    getErrorProps,
  };
};

/**
 * Hook for managing accessible loading states
 */
export const useAccessibleLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Loading");

  const startLoading = (message: string = "Loading") => {
    setLoadingMessage(message);
    setIsLoading(true);
    announceToScreenReader(message);
  };

  const stopLoading = (successMessage?: string) => {
    setIsLoading(false);
    if (successMessage) {
      announceToScreenReader(successMessage);
    }
  };

  const loadingProps = {
    "aria-busy": isLoading,
    "aria-live": "polite" as const,
    "aria-label": isLoading ? loadingMessage : undefined,
  };

  return {
    isLoading,
    loadingMessage,
    startLoading,
    stopLoading,
    loadingProps,
  };
};

/**
 * Hook for managing accessible progress indicators
 */
export const useAccessibleProgress = (max: number = 100) => {
  const [value, setValue] = useState(0);
  const [label, setLabel] = useState("");

  const updateProgress = (newValue: number, newLabel?: string) => {
    setValue(Math.min(Math.max(newValue, 0), max));
    if (newLabel) {
      setLabel(newLabel);
    }

    // Announce progress updates
    const percentage = Math.round((newValue / max) * 100);
    announceToScreenReader(`${percentage}% complete`);
  };

  const progressProps = {
    role: "progressbar",
    "aria-valuenow": value,
    "aria-valuemin": 0,
    "aria-valuemax": max,
    "aria-valuetext": `${value} of ${max}`,
    "aria-label": label,
  };

  return {
    value,
    max,
    label,
    updateProgress,
    progressProps,
  };
};

/**
 * Hook for managing accessible modal dialogs
 */
export const useAccessibleModal = (titleId: string, descriptionId?: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const modalRef = useFocusTrap(isOpen);
  const { saveFocus, restoreFocus } = useFocusRestore();

  const openModal = () => {
    saveFocus();
    setIsOpen(true);
    announceToScreenReader("Modal dialog opened");
  };

  const closeModal = () => {
    setIsOpen(false);
    restoreFocus();
    announceToScreenReader("Modal dialog closed");
  };

  useKeyboardNavigation(
    {
      [KEYBOARD_KEYS.ESCAPE]: closeModal,
    },
    isOpen
  );

  const modalProps = {
    ref: modalRef,
    role: "dialog",
    "aria-modal": true,
    "aria-labelledby": titleId,
    "aria-describedby": descriptionId,
  };

  return {
    isOpen,
    openModal,
    closeModal,
    modalProps,
  };
};

/**
 * Hook for managing accessible tabs
 */
export const useAccessibleTabs = (tabs: string[]) => {
  const [activeTab, setActiveTab] = useState(0);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  const handleTabKeyDown = (index: number) => (event: KeyboardEvent) => {
    let newIndex = index;

    switch (event.key) {
      case KEYBOARD_KEYS.ARROW_RIGHT:
        newIndex = (index + 1) % tabs.length;
        break;
      case KEYBOARD_KEYS.ARROW_LEFT:
        newIndex = (index - 1 + tabs.length) % tabs.length;
        break;
      case KEYBOARD_KEYS.HOME:
        newIndex = 0;
        break;
      case KEYBOARD_KEYS.END:
        newIndex = tabs.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    setActiveTab(newIndex);
    focusElement(tabRefs.current[newIndex]);
  };

  const getTabProps = (index: number) => ({
    ref: (el: HTMLElement | null) => {
      tabRefs.current[index] = el;
    },
    role: "tab",
    "aria-selected": index === activeTab,
    "aria-controls": `tabpanel-${index}`,
    id: `tab-${index}`,
    tabIndex: index === activeTab ? 0 : -1,
    onClick: () => setActiveTab(index),
    onKeyDown: handleTabKeyDown(index),
  });

  const getTabPanelProps = (index: number) => ({
    role: "tabpanel",
    "aria-labelledby": `tab-${index}`,
    id: `tabpanel-${index}`,
    hidden: index !== activeTab,
  });

  const tabListProps = {
    role: "tablist",
    "aria-orientation": "horizontal" as const,
  };

  return {
    activeTab,
    setActiveTab,
    getTabProps,
    getTabPanelProps,
    tabListProps,
  };
};

/**
 * Hook for managing accessible tooltips
 */
export const useAccessibleTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useAccessibleId("tooltip");

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  const triggerProps = {
    "aria-describedby": isVisible ? tooltipId : undefined,
    onMouseEnter: showTooltip,
    onMouseLeave: hideTooltip,
    onFocus: showTooltip,
    onBlur: hideTooltip,
  };

  const tooltipProps = {
    id: tooltipId,
    role: "tooltip",
    "aria-hidden": !isVisible,
  };

  return {
    isVisible,
    triggerProps,
    tooltipProps,
  };
};
