import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface VideoClip {
  id: string;
  url: string;
  startTime: number;
  endTime: number;
  duration: number;
  order: number;
  volume: number;
  effects: Effect[];
}

export interface Effect {
  id: string;
  type: "filter" | "transition" | "text" | "audio";
  name: string;
  parameters: Record<string, any>;
  startTime: number;
  duration: number;
  enabled: boolean;
}

export interface TextOverlay {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    bold: boolean;
    italic: boolean;
  };
  animation?: "fade-in" | "slide-up" | "zoom-in" | "typewriter";
}

export interface AudioTrack {
  id: string;
  url: string;
  type: "background" | "voiceover" | "sfx";
  volume: number;
  startTime: number;
  duration: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface ExportSettings {
  resolution: "1080p" | "720p" | "480p";
  fps: 24 | 30 | 60;
  format: "mp4" | "mov" | "webm";
  quality: "high" | "medium" | "low";
  aspectRatio: "9:16" | "16:9" | "1:1";
}

export interface TimelineState {
  currentTime: number;
  duration: number;
  zoom: number;
  scrollPosition: number;
  selectedClipId?: string;
  selectedEffectId?: string;
  selectedTextId?: string;
}

export interface VideoEditorState {
  // Project data
  projectId?: string;
  projectName: string;
  clips: VideoClip[];
  textOverlays: TextOverlay[];
  audioTracks: AudioTrack[];

  // Playback state
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  playbackRate: number;

  // Timeline state
  timeline: TimelineState;

  // UI state
  activePanel: "clips" | "effects" | "text" | "audio" | "export";
  isFullscreen: boolean;

  // Export state
  exportSettings: ExportSettings;
  isExporting: boolean;
  exportProgress: number;

  // History for undo/redo
  history: any[];
  historyIndex: number;

  // Actions - Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  setPlaybackRate: (rate: number) => void;
  toggleMute: () => void;

  // Actions - Timeline
  setCurrentTime: (time: number) => void;
  setZoom: (zoom: number) => void;
  setScrollPosition: (position: number) => void;
  selectClip: (clipId?: string) => void;
  selectEffect: (effectId?: string) => void;
  selectText: (textId?: string) => void;

  // Actions - Clips
  addClip: (clip: Omit<VideoClip, "id" | "order">) => void;
  removeClip: (clipId: string) => void;
  updateClip: (clipId: string, updates: Partial<VideoClip>) => void;
  reorderClips: (clipIds: string[]) => void;
  trimClip: (clipId: string, startTime: number, endTime: number) => void;

  // Actions - Effects
  addEffect: (clipId: string, effect: Omit<Effect, "id">) => void;
  removeEffect: (effectId: string) => void;
  updateEffect: (effectId: string, updates: Partial<Effect>) => void;
  toggleEffect: (effectId: string) => void;

  // Actions - Text
  addTextOverlay: (text: Omit<TextOverlay, "id">) => void;
  removeTextOverlay: (textId: string) => void;
  updateTextOverlay: (textId: string, updates: Partial<TextOverlay>) => void;

  // Actions - Audio
  addAudioTrack: (audio: Omit<AudioTrack, "id">) => void;
  removeAudioTrack: (audioId: string) => void;
  updateAudioTrack: (audioId: string, updates: Partial<AudioTrack>) => void;

  // Actions - UI
  setActivePanel: (panel: VideoEditorState["activePanel"]) => void;
  toggleFullscreen: () => void;

  // Actions - Export
  setExportSettings: (settings: Partial<ExportSettings>) => void;
  startExport: () => void;
  updateExportProgress: (progress: number) => void;
  completeExport: () => void;

  // Actions - Project
  loadProject: (projectData: any) => void;
  saveProject: () => any;
  resetProject: () => void;

  // Actions - History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
}

const defaultExportSettings: ExportSettings = {
  resolution: "1080p",
  fps: 30,
  format: "mp4",
  quality: "high",
  aspectRatio: "9:16",
};

export const useVideoEditorStore = create<VideoEditorState>()(
  devtools(
    immer((set, get) => ({
      // Initial state
      projectName: "Untitled Project",
      clips: [],
      textOverlays: [],
      audioTracks: [],

      isPlaying: false,
      isMuted: false,
      volume: 1,
      playbackRate: 1,

      timeline: {
        currentTime: 0,
        duration: 0,
        zoom: 1,
        scrollPosition: 0,
      },

      activePanel: "clips",
      isFullscreen: false,

      exportSettings: defaultExportSettings,
      isExporting: false,
      exportProgress: 0,

      history: [],
      historyIndex: -1,

      // Playback actions
      play: () => {
        set((state) => {
          state.isPlaying = true;
        });
      },

      pause: () => {
        set((state) => {
          state.isPlaying = false;
        });
      },

      stop: () => {
        set((state) => {
          state.isPlaying = false;
          state.timeline.currentTime = 0;
        });
      },

      seek: (time) => {
        set((state) => {
          state.timeline.currentTime = Math.max(
            0,
            Math.min(time, state.timeline.duration)
          );
        });
      },

      setVolume: (volume) => {
        set((state) => {
          state.volume = Math.max(0, Math.min(1, volume));
          if (volume > 0) {
            state.isMuted = false;
          }
        });
      },

      setPlaybackRate: (rate) => {
        set((state) => {
          state.playbackRate = rate;
        });
      },

      toggleMute: () => {
        set((state) => {
          state.isMuted = !state.isMuted;
        });
      },

      // Timeline actions
      setCurrentTime: (time) => {
        set((state) => {
          state.timeline.currentTime = time;
        });
      },

      setZoom: (zoom) => {
        set((state) => {
          state.timeline.zoom = Math.max(0.1, Math.min(10, zoom));
        });
      },

      setScrollPosition: (position) => {
        set((state) => {
          state.timeline.scrollPosition = position;
        });
      },

      selectClip: (clipId) => {
        set((state) => {
          state.timeline.selectedClipId = clipId;
          state.timeline.selectedEffectId = undefined;
          state.timeline.selectedTextId = undefined;
        });
      },

      selectEffect: (effectId) => {
        set((state) => {
          state.timeline.selectedEffectId = effectId;
          state.timeline.selectedClipId = undefined;
          state.timeline.selectedTextId = undefined;
        });
      },

      selectText: (textId) => {
        set((state) => {
          state.timeline.selectedTextId = textId;
          state.timeline.selectedClipId = undefined;
          state.timeline.selectedEffectId = undefined;
        });
      },

      // Clip actions
      addClip: (clipData) => {
        const id = `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const order = get().clips.length;

        set((state) => {
          const clip: VideoClip = {
            ...clipData,
            id,
            order,
          };
          state.clips.push(clip);

          // Update timeline duration
          const totalDuration = state.clips.reduce(
            (acc, c) => acc + c.duration,
            0
          );
          state.timeline.duration = totalDuration;
        });

        get().pushToHistory();
      },

      removeClip: (clipId) => {
        set((state) => {
          state.clips = state.clips.filter((c) => c.id !== clipId);

          // Reorder remaining clips
          state.clips.forEach((clip, index) => {
            clip.order = index;
          });

          // Update timeline duration
          const totalDuration = state.clips.reduce(
            (acc, c) => acc + c.duration,
            0
          );
          state.timeline.duration = totalDuration;

          // Clear selection if removed
          if (state.timeline.selectedClipId === clipId) {
            state.timeline.selectedClipId = undefined;
          }
        });

        get().pushToHistory();
      },

      updateClip: (clipId, updates) => {
        set((state) => {
          const clip = state.clips.find((c) => c.id === clipId);
          if (clip) {
            Object.assign(clip, updates);
          }
        });

        get().pushToHistory();
      },

      reorderClips: (clipIds) => {
        set((state) => {
          const reorderedClips = clipIds
            .map((id) => state.clips.find((c) => c.id === id))
            .filter(Boolean) as VideoClip[];

          reorderedClips.forEach((clip, index) => {
            clip.order = index;
          });

          state.clips = reorderedClips;
        });

        get().pushToHistory();
      },

      trimClip: (clipId, startTime, endTime) => {
        set((state) => {
          const clip = state.clips.find((c) => c.id === clipId);
          if (clip) {
            clip.startTime = startTime;
            clip.endTime = endTime;
            clip.duration = endTime - startTime;

            // Update timeline duration
            const totalDuration = state.clips.reduce(
              (acc, c) => acc + c.duration,
              0
            );
            state.timeline.duration = totalDuration;
          }
        });

        get().pushToHistory();
      },

      // Effect actions
      addEffect: (clipId, effectData) => {
        const id = `effect-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => {
          const clip = state.clips.find((c) => c.id === clipId);
          if (clip) {
            const effect: Effect = {
              ...effectData,
              id,
            };
            clip.effects.push(effect);
          }
        });

        get().pushToHistory();
      },

      removeEffect: (effectId) => {
        set((state) => {
          state.clips.forEach((clip) => {
            clip.effects = clip.effects.filter((e) => e.id !== effectId);
          });

          if (state.timeline.selectedEffectId === effectId) {
            state.timeline.selectedEffectId = undefined;
          }
        });

        get().pushToHistory();
      },

      updateEffect: (effectId, updates) => {
        set((state) => {
          state.clips.forEach((clip) => {
            const effect = clip.effects.find((e) => e.id === effectId);
            if (effect) {
              Object.assign(effect, updates);
            }
          });
        });

        get().pushToHistory();
      },

      toggleEffect: (effectId) => {
        set((state) => {
          state.clips.forEach((clip) => {
            const effect = clip.effects.find((e) => e.id === effectId);
            if (effect) {
              effect.enabled = !effect.enabled;
            }
          });
        });

        get().pushToHistory();
      },

      // Text actions
      addTextOverlay: (textData) => {
        const id = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => {
          const textOverlay: TextOverlay = {
            ...textData,
            id,
          };
          state.textOverlays.push(textOverlay);
        });

        get().pushToHistory();
      },

      removeTextOverlay: (textId) => {
        set((state) => {
          state.textOverlays = state.textOverlays.filter(
            (t) => t.id !== textId
          );

          if (state.timeline.selectedTextId === textId) {
            state.timeline.selectedTextId = undefined;
          }
        });

        get().pushToHistory();
      },

      updateTextOverlay: (textId, updates) => {
        set((state) => {
          const textOverlay = state.textOverlays.find((t) => t.id === textId);
          if (textOverlay) {
            Object.assign(textOverlay, updates);
          }
        });

        get().pushToHistory();
      },

      // Audio actions
      addAudioTrack: (audioData) => {
        const id = `audio-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        set((state) => {
          const audioTrack: AudioTrack = {
            ...audioData,
            id,
          };
          state.audioTracks.push(audioTrack);
        });

        get().pushToHistory();
      },

      removeAudioTrack: (audioId) => {
        set((state) => {
          state.audioTracks = state.audioTracks.filter((a) => a.id !== audioId);
        });

        get().pushToHistory();
      },

      updateAudioTrack: (audioId, updates) => {
        set((state) => {
          const audioTrack = state.audioTracks.find((a) => a.id === audioId);
          if (audioTrack) {
            Object.assign(audioTrack, updates);
          }
        });

        get().pushToHistory();
      },

      // UI actions
      setActivePanel: (panel) => {
        set((state) => {
          state.activePanel = panel;
        });
      },

      toggleFullscreen: () => {
        set((state) => {
          state.isFullscreen = !state.isFullscreen;
        });
      },

      // Export actions
      setExportSettings: (settings) => {
        set((state) => {
          Object.assign(state.exportSettings, settings);
        });
      },

      startExport: () => {
        set((state) => {
          state.isExporting = true;
          state.exportProgress = 0;
        });
      },

      updateExportProgress: (progress) => {
        set((state) => {
          state.exportProgress = Math.max(0, Math.min(100, progress));
        });
      },

      completeExport: () => {
        set((state) => {
          state.isExporting = false;
          state.exportProgress = 100;
        });
      },

      // Project actions
      loadProject: (projectData) => {
        set((state) => {
          Object.assign(state, projectData);
          state.history = [];
          state.historyIndex = -1;
        });
      },

      saveProject: () => {
        const state = get();
        return {
          projectName: state.projectName,
          clips: state.clips,
          textOverlays: state.textOverlays,
          audioTracks: state.audioTracks,
          exportSettings: state.exportSettings,
        };
      },

      resetProject: () => {
        set((state) => {
          state.projectName = "Untitled Project";
          state.clips = [];
          state.textOverlays = [];
          state.audioTracks = [];
          state.timeline.currentTime = 0;
          state.timeline.duration = 0;
          state.timeline.selectedClipId = undefined;
          state.timeline.selectedEffectId = undefined;
          state.timeline.selectedTextId = undefined;
          state.history = [];
          state.historyIndex = -1;
        });
      },

      // History actions
      pushToHistory: () => {
        set((state) => {
          const snapshot = get().saveProject();

          // Remove any history after current index
          state.history = state.history.slice(0, state.historyIndex + 1);

          // Add new snapshot
          state.history.push(snapshot);
          state.historyIndex = state.history.length - 1;

          // Limit history size
          if (state.history.length > 50) {
            state.history.shift();
            state.historyIndex--;
          }
        });
      },

      undo: () => {
        const state = get();
        if (state.historyIndex > 0) {
          const newIndex = state.historyIndex - 1;
          const snapshot = state.history[newIndex];

          set((draft) => {
            Object.assign(draft, snapshot);
            draft.historyIndex = newIndex;
          });
        }
      },

      redo: () => {
        const state = get();
        if (state.historyIndex < state.history.length - 1) {
          const newIndex = state.historyIndex + 1;
          const snapshot = state.history[newIndex];

          set((draft) => {
            Object.assign(draft, snapshot);
            draft.historyIndex = newIndex;
          });
        }
      },
    })),
    {
      name: "video-editor-store",
    }
  )
);

// Selectors for common use cases
export const usePlayback = () =>
  useVideoEditorStore((state) => ({
    isPlaying: state.isPlaying,
    isMuted: state.isMuted,
    volume: state.volume,
    playbackRate: state.playbackRate,
    currentTime: state.timeline.currentTime,
    duration: state.timeline.duration,
    play: state.play,
    pause: state.pause,
    stop: state.stop,
    seek: state.seek,
    setVolume: state.setVolume,
    setPlaybackRate: state.setPlaybackRate,
    toggleMute: state.toggleMute,
  }));

export const useTimeline = () =>
  useVideoEditorStore((state) => ({
    timeline: state.timeline,
    setCurrentTime: state.setCurrentTime,
    setZoom: state.setZoom,
    setScrollPosition: state.setScrollPosition,
    selectClip: state.selectClip,
    selectEffect: state.selectEffect,
    selectText: state.selectText,
  }));

export const useClips = () =>
  useVideoEditorStore((state) => ({
    clips: state.clips,
    addClip: state.addClip,
    removeClip: state.removeClip,
    updateClip: state.updateClip,
    reorderClips: state.reorderClips,
    trimClip: state.trimClip,
  }));

export const useEffects = () =>
  useVideoEditorStore((state) => ({
    clips: state.clips,
    addEffect: state.addEffect,
    removeEffect: state.removeEffect,
    updateEffect: state.updateEffect,
    toggleEffect: state.toggleEffect,
  }));

export const useTextOverlays = () =>
  useVideoEditorStore((state) => ({
    textOverlays: state.textOverlays,
    addTextOverlay: state.addTextOverlay,
    removeTextOverlay: state.removeTextOverlay,
    updateTextOverlay: state.updateTextOverlay,
  }));

export const useAudioTracks = () =>
  useVideoEditorStore((state) => ({
    audioTracks: state.audioTracks,
    addAudioTrack: state.addAudioTrack,
    removeAudioTrack: state.removeAudioTrack,
    updateAudioTrack: state.updateAudioTrack,
  }));

export const useExport = () =>
  useVideoEditorStore((state) => ({
    exportSettings: state.exportSettings,
    isExporting: state.isExporting,
    exportProgress: state.exportProgress,
    setExportSettings: state.setExportSettings,
    startExport: state.startExport,
    updateExportProgress: state.updateExportProgress,
    completeExport: state.completeExport,
  }));

export const useProjectActions = () =>
  useVideoEditorStore((state) => ({
    projectName: state.projectName,
    loadProject: state.loadProject,
    saveProject: state.saveProject,
    resetProject: state.resetProject,
    undo: state.undo,
    redo: state.redo,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  }));
