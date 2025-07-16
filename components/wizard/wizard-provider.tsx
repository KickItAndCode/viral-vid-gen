"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { WizardConfig } from "./types";
import { useWizardStore } from "./wizard-store";

interface WizardContextValue {
  config: WizardConfig;
  isInitialized: boolean;
}

const WizardContext = createContext<WizardContextValue | null>(null);

interface WizardProviderProps {
  config: WizardConfig;
  children: React.ReactNode;
  autoLoadProgress?: boolean;
  sessionId?: string;
}

export function WizardProvider({
  config,
  children,
  autoLoadProgress = true,
  sessionId,
}: WizardProviderProps) {
  // Use a ref to track if we've initialized
  const initRef = React.useRef(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Initialize only once when component mounts
  React.useLayoutEffect(() => {
    if (initRef.current) return;

    initRef.current = true;

    // Initialize wizard store with config - do this synchronously
    const store = useWizardStore.getState();
    store.resetWizard(); // Start with clean state

    // Set initial config without triggering re-renders
    const initialState = {
      totalSteps: config.steps.length,
      currentStepId: config.steps[0]?.id || "",
      currentStepIndex: 0,
      data: store.data, // Keep existing data
    };

    // Use direct store update to avoid triggering subscribers during render
    Object.assign(store, initialState);

    // Auto-load progress if enabled
    if (autoLoadProgress && sessionId) {
      store.loadProgress(sessionId);
    }

    setIsInitialized(true);
  }, []); // Only run once on mount

  const contextValue: WizardContextValue = useMemo(
    () => ({
      config,
      isInitialized,
    }),
    [config, isInitialized]
  );

  return (
    <WizardContext.Provider value={contextValue}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizardContext() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizardContext must be used within a WizardProvider");
  }
  return context;
}

// Helper hook for accessing wizard config
export function useWizardConfig() {
  const { config } = useWizardContext();
  return config;
}

// Helper hook to check if wizard is ready
export function useWizardReady() {
  const { isInitialized } = useWizardContext();
  return isInitialized;
}
