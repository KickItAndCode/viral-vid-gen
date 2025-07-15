"use client";

import React, { createContext, useContext, useEffect } from "react";
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
  const [isInitialized, setIsInitialized] = React.useState(false);

  useEffect(() => {
    // Initialize wizard store with config
    useWizardStore.setState({
      totalSteps: config.steps.length,
      currentStepId: config.steps[0]?.id || "",
      currentStepIndex: 0,
    });

    // Auto-load progress if enabled
    if (autoLoadProgress && sessionId) {
      useWizardStore.getState().loadProgress(sessionId);
    } else if (!autoLoadProgress) {
      // Reset wizard if not auto-loading
      useWizardStore.getState().resetWizard();
    }

    setIsInitialized(true);
  }, [config.steps.length, autoLoadProgress, sessionId]);

  const contextValue: WizardContextValue = {
    config,
    isInitialized,
  };

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
