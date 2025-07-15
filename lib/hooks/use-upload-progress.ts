import { useState, useEffect, useCallback, useRef } from 'react';
import { UploadProgress, UploadSession, uploadProgressTracker } from '@/lib/upload/progress-tracker';

export interface UseUploadProgressOptions {
  uploadId: string;
  autoRemove?: boolean;
  onComplete?: (progress: UploadProgress) => void;
  onError?: (error: string) => void;
  onProgress?: (progress: UploadProgress) => void;
}

export interface UseUploadProgressReturn {
  progress: UploadProgress | null;
  isUploading: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  error: string | null;
  percentage: number;
  speed: number;
  timeRemaining: number;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  retry: () => void;
}

export const useUploadProgress = (options: UseUploadProgressOptions): UseUploadProgressReturn => {
  const { uploadId, autoRemove = true, onComplete, onError, onProgress } = options;
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const callbacksRef = useRef({ onComplete, onError, onProgress });
  const mountedRef = useRef(true);

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = { onComplete, onError, onProgress };
  }, [onComplete, onError, onProgress]);

  // Handle progress updates
  const handleProgress = useCallback((newProgress: UploadProgress) => {
    if (!mountedRef.current) return;

    setProgress(newProgress);
    
    // Call progress callback
    if (callbacksRef.current.onProgress) {
      callbacksRef.current.onProgress(newProgress);
    }

    // Handle completion
    if (newProgress.stage === 'completed' && callbacksRef.current.onComplete) {
      callbacksRef.current.onComplete(newProgress);
    }

    // Handle failure
    if (newProgress.stage === 'failed' && callbacksRef.current.onError) {
      callbacksRef.current.onError(newProgress.error || 'Upload failed');
    }
  }, []);

  // Set up progress tracking
  useEffect(() => {
    if (!uploadId) return;

    // Get initial progress
    const initialProgress = uploadProgressTracker.getProgress(uploadId);
    if (initialProgress) {
      setProgress(initialProgress);
    }

    // Add progress callback
    uploadProgressTracker.addProgressCallback(uploadId, handleProgress);

    // Cleanup function
    return () => {
      uploadProgressTracker.removeProgressCallback(uploadId, handleProgress);
      
      if (autoRemove && progress?.stage === 'completed') {
        uploadProgressTracker.removeSession(uploadId);
      }
    };
  }, [uploadId, handleProgress, autoRemove, progress?.stage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Control functions
  const pause = useCallback(() => {
    uploadProgressTracker.pauseSession(uploadId);
  }, [uploadId]);

  const resume = useCallback(() => {
    uploadProgressTracker.resumeSession(uploadId);
  }, [uploadId]);

  const cancel = useCallback(() => {
    uploadProgressTracker.failSession(uploadId, 'Upload cancelled by user');
  }, [uploadId]);

  const retry = useCallback(() => {
    // Reset progress and resume upload
    uploadProgressTracker.resumeSession(uploadId);
  }, [uploadId]);

  // Derived state
  const isUploading = progress?.stage === 'uploading';
  const isCompleted = progress?.stage === 'completed';
  const isFailed = progress?.stage === 'failed';
  const error = progress?.error || null;
  const percentage = progress?.percentage || 0;
  const speed = progress?.speed || 0;
  const timeRemaining = progress?.timeRemaining || 0;

  return {
    progress,
    isUploading,
    isCompleted,
    isFailed,
    error,
    percentage,
    speed,
    timeRemaining,
    pause,
    resume,
    cancel,
    retry,
  };
};

// Hook for tracking multiple uploads
export interface UseMultiUploadProgressOptions {
  autoRemove?: boolean;
  onComplete?: (uploadId: string, progress: UploadProgress) => void;
  onError?: (uploadId: string, error: string) => void;
  onProgress?: (uploadId: string, progress: UploadProgress) => void;
}

export interface UseMultiUploadProgressReturn {
  uploads: UploadProgress[];
  activeUploads: UploadProgress[];
  completedUploads: UploadProgress[];
  failedUploads: UploadProgress[];
  totalProgress: {
    percentage: number;
    uploadedSize: number;
    totalSize: number;
    speed: number;
    timeRemaining: number;
  };
  addUpload: (uploadId: string) => void;
  removeUpload: (uploadId: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  cancelAll: () => void;
  retryFailed: () => void;
}

export const useMultiUploadProgress = (options: UseMultiUploadProgressOptions = {}): UseMultiUploadProgressReturn => {
  const { autoRemove = true, onComplete, onError, onProgress } = options;
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const [trackedUploads, setTrackedUploads] = useState<Set<string>>(new Set());
  const callbacksRef = useRef({ onComplete, onError, onProgress });
  const mountedRef = useRef(true);

  // Update callbacks ref when props change
  useEffect(() => {
    callbacksRef.current = { onComplete, onError, onProgress };
  }, [onComplete, onError, onProgress]);

  // Handle progress updates
  const handleProgress = useCallback((progress: UploadProgress) => {
    if (!mountedRef.current) return;

    setUploads(prev => {
      const index = prev.findIndex(p => p.uploadId === progress.uploadId);
      if (index >= 0) {
        const newUploads = [...prev];
        newUploads[index] = progress;
        return newUploads;
      }
      return [...prev, progress];
    });

    // Call progress callback
    if (callbacksRef.current.onProgress) {
      callbacksRef.current.onProgress(progress.uploadId, progress);
    }

    // Handle completion
    if (progress.stage === 'completed' && callbacksRef.current.onComplete) {
      callbacksRef.current.onComplete(progress.uploadId, progress);
    }

    // Handle failure
    if (progress.stage === 'failed' && callbacksRef.current.onError) {
      callbacksRef.current.onError(progress.uploadId, progress.error || 'Upload failed');
    }
  }, []);

  // Set up global progress tracking
  useEffect(() => {
    uploadProgressTracker.on('progress', handleProgress);

    return () => {
      uploadProgressTracker.off('progress', handleProgress);
    };
  }, [handleProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Add upload to tracking
  const addUpload = useCallback((uploadId: string) => {
    setTrackedUploads(prev => new Set([...prev, uploadId]));
    
    // Get initial progress
    const initialProgress = uploadProgressTracker.getProgress(uploadId);
    if (initialProgress) {
      handleProgress(initialProgress);
    }
  }, [handleProgress]);

  // Remove upload from tracking
  const removeUpload = useCallback((uploadId: string) => {
    setTrackedUploads(prev => {
      const newSet = new Set(prev);
      newSet.delete(uploadId);
      return newSet;
    });
    
    setUploads(prev => prev.filter(p => p.uploadId !== uploadId));
    
    if (autoRemove) {
      uploadProgressTracker.removeSession(uploadId);
    }
  }, [autoRemove]);

  // Control functions
  const pauseAll = useCallback(() => {
    trackedUploads.forEach(uploadId => {
      uploadProgressTracker.pauseSession(uploadId);
    });
  }, [trackedUploads]);

  const resumeAll = useCallback(() => {
    trackedUploads.forEach(uploadId => {
      uploadProgressTracker.resumeSession(uploadId);
    });
  }, [trackedUploads]);

  const cancelAll = useCallback(() => {
    trackedUploads.forEach(uploadId => {
      uploadProgressTracker.failSession(uploadId, 'Upload cancelled by user');
    });
  }, [trackedUploads]);

  const retryFailed = useCallback(() => {
    const failedUploads = uploads.filter(p => p.stage === 'failed');
    failedUploads.forEach(upload => {
      uploadProgressTracker.resumeSession(upload.uploadId);
    });
  }, [uploads]);

  // Derived state
  const activeUploads = uploads.filter(p => p.stage === 'uploading');
  const completedUploads = uploads.filter(p => p.stage === 'completed');
  const failedUploads = uploads.filter(p => p.stage === 'failed');

  // Calculate total progress
  const totalProgress = {
    percentage: uploads.length > 0 ? uploads.reduce((sum, p) => sum + p.percentage, 0) / uploads.length : 0,
    uploadedSize: uploads.reduce((sum, p) => sum + p.uploadedSize, 0),
    totalSize: uploads.reduce((sum, p) => sum + p.totalSize, 0),
    speed: uploads.reduce((sum, p) => sum + p.speed, 0),
    timeRemaining: Math.max(...uploads.map(p => p.timeRemaining), 0),
  };

  return {
    uploads,
    activeUploads,
    completedUploads,
    failedUploads,
    totalProgress,
    addUpload,
    removeUpload,
    pauseAll,
    resumeAll,
    cancelAll,
    retryFailed,
  };
};

// Hook for upload session statistics
export const useUploadStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
    failed: 0,
    totalSize: 0,
    uploadedSize: 0,
  });

  useEffect(() => {
    const updateStats = () => {
      const newStats = uploadProgressTracker.getSessionStats();
      setStats(newStats);
    };

    // Update stats initially
    updateStats();

    // Update stats on progress changes
    uploadProgressTracker.on('progress', updateStats);

    // Update stats periodically
    const interval = setInterval(updateStats, 5000);

    return () => {
      uploadProgressTracker.off('progress', updateStats);
      clearInterval(interval);
    };
  }, []);

  return stats;
};