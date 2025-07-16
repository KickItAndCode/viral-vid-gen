import { useEffect, useCallback } from "react";
import {
  useClips,
  useTimeline,
  useProjectActions,
} from "@/lib/stores/video-editor-store";

export interface UseEditorShortcutsProps {
  /** Currently selected clip */
  selectedClip?: any;
  /** Current playback time */
  currentTime: number;
  /** Callback for split at current time */
  onSplitAtCurrentTime?: () => void;
  /** Callback for trim start */
  onTrimStart?: () => void;
  /** Callback for copy clip */
  onCopyClip?: () => void;
  /** Callback for paste clip */
  onPasteClip?: () => void;
  /** Callback for delete clip */
  onDeleteClip?: () => void;
}

export const useEditorShortcuts = ({
  selectedClip,
  currentTime,
  onSplitAtCurrentTime,
  onTrimStart,
  onCopyClip,
  onPasteClip,
  onDeleteClip,
}: UseEditorShortcutsProps) => {
  const { removeClip, addClip } = useClips();
  const { undo, redo } = useProjectActions();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifierPressed = ctrlKey || metaKey;

      switch (key.toLowerCase()) {
        // Split clip at current time
        case "s":
          if (!isModifierPressed && selectedClip) {
            event.preventDefault();
            onSplitAtCurrentTime?.();
          }
          break;

        // Trim clip
        case "t":
          if (!isModifierPressed && selectedClip) {
            event.preventDefault();
            onTrimStart?.();
          }
          break;

        // Copy clip
        case "c":
          if (isModifierPressed && selectedClip) {
            event.preventDefault();
            onCopyClip?.();
          }
          break;

        // Paste clip
        case "v":
          if (isModifierPressed) {
            event.preventDefault();
            onPasteClip?.();
          }
          break;

        // Delete clip
        case "delete":
        case "backspace":
          if (selectedClip && !isModifierPressed) {
            event.preventDefault();
            onDeleteClip?.();
          }
          break;

        // Undo
        case "z":
          if (isModifierPressed && !shiftKey) {
            event.preventDefault();
            undo();
          }
          break;

        // Redo
        case "y":
          if (isModifierPressed) {
            event.preventDefault();
            redo();
          }
          break;

        // Redo (alternative)
        case "z":
          if (isModifierPressed && shiftKey) {
            event.preventDefault();
            redo();
          }
          break;

        // Duplicate clip
        case "d":
          if (isModifierPressed && selectedClip) {
            event.preventDefault();
            // Duplicate the selected clip
            addClip({
              url: selectedClip.url,
              startTime: selectedClip.endTime,
              endTime: selectedClip.endTime + selectedClip.duration,
              duration: selectedClip.duration,
              volume: selectedClip.volume,
              effects: [...selectedClip.effects],
            });
          }
          break;

        default:
          break;
      }
    },
    [
      selectedClip,
      currentTime,
      onSplitAtCurrentTime,
      onTrimStart,
      onCopyClip,
      onPasteClip,
      onDeleteClip,
      removeClip,
      addClip,
      undo,
      redo,
    ]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Return any additional state or functions if needed
  };
};
