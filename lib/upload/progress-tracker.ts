import { EventEmitter } from "events";

export interface UploadProgress {
  uploadId: string;
  filename: string;
  totalSize: number;
  uploadedSize: number;
  percentage: number;
  speed: number; // bytes per second
  timeRemaining: number; // seconds
  stage: "preparing" | "uploading" | "processing" | "completed" | "failed";
  error?: string;
  startTime: number;
  lastUpdate: number;
  chunkSize: number;
  completedChunks: number;
  totalChunks: number;
}

export interface UploadChunk {
  index: number;
  start: number;
  end: number;
  size: number;
  uploaded: boolean;
  retryCount: number;
  uploadSpeed: number;
  etag?: string;
}

export interface UploadSession {
  uploadId: string;
  filename: string;
  totalSize: number;
  chunkSize: number;
  chunks: UploadChunk[];
  uploadedSize: number;
  startTime: number;
  lastActivity: number;
  multipartUploadId?: string;
  key: string;
  contentType: string;
  metadata: Record<string, string>;
  stage: UploadProgress["stage"];
  error?: string;
}

export interface ProgressCallback {
  (progress: UploadProgress): void;
}

export class UploadProgressTracker extends EventEmitter {
  private sessions: Map<string, UploadSession> = new Map();
  private progressCallbacks: Map<string, ProgressCallback[]> = new Map();
  private cleanupInterval: NodeJS.Timeout;
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

  constructor() {
    super();
    this.setupCleanupInterval();
  }

  /**
   * Create a new upload session
   */
  createSession(
    uploadId: string,
    filename: string,
    totalSize: number,
    chunkSize: number,
    key: string,
    contentType: string,
    metadata: Record<string, string> = {}
  ): UploadSession {
    const totalChunks = Math.ceil(totalSize / chunkSize);
    const chunks: UploadChunk[] = [];

    // Initialize chunks
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize - 1, totalSize - 1);
      const size = end - start + 1;

      chunks.push({
        index: i,
        start,
        end,
        size,
        uploaded: false,
        retryCount: 0,
        uploadSpeed: 0,
      });
    }

    const session: UploadSession = {
      uploadId,
      filename,
      totalSize,
      chunkSize,
      chunks,
      uploadedSize: 0,
      startTime: Date.now(),
      lastActivity: Date.now(),
      key,
      contentType,
      metadata,
      stage: "preparing",
    };

    this.sessions.set(uploadId, session);
    this.progressCallbacks.set(uploadId, []);

    console.log(
      `Created upload session: ${uploadId} (${filename}, ${totalSize} bytes)`
    );
    return session;
  }

  /**
   * Update chunk progress
   */
  updateChunkProgress(
    uploadId: string,
    chunkIndex: number,
    uploadedBytes: number,
    speed: number = 0
  ): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    const chunk = session.chunks[chunkIndex];
    if (!chunk) return;

    // Update chunk progress
    chunk.uploadSpeed = speed;

    // Calculate total uploaded size
    const previousUploadedSize = session.uploadedSize;
    session.uploadedSize = session.chunks.reduce((total, c) => {
      if (c.uploaded) return total + c.size;
      if (c.index === chunkIndex) return total + uploadedBytes;
      return total;
    }, 0);

    session.lastActivity = Date.now();
    session.stage = "uploading";

    // Emit progress event
    this.emitProgress(session);
  }

  /**
   * Mark chunk as completed
   */
  completeChunk(uploadId: string, chunkIndex: number, etag?: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    const chunk = session.chunks[chunkIndex];
    if (!chunk) return;

    chunk.uploaded = true;
    chunk.etag = etag;
    session.uploadedSize = session.chunks.reduce(
      (total, c) => (c.uploaded ? total + c.size : total),
      0
    );
    session.lastActivity = Date.now();

    console.log(`Chunk ${chunkIndex} completed for upload ${uploadId}`);

    // Check if all chunks are completed
    const completedChunks = session.chunks.filter((c) => c.uploaded).length;
    if (completedChunks === session.chunks.length) {
      session.stage = "processing";
    }

    this.emitProgress(session);
  }

  /**
   * Mark chunk as failed
   */
  failChunk(uploadId: string, chunkIndex: number, error: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    const chunk = session.chunks[chunkIndex];
    if (!chunk) return;

    chunk.retryCount++;
    session.lastActivity = Date.now();

    console.log(`Chunk ${chunkIndex} failed for upload ${uploadId}: ${error}`);

    // If too many retries, mark upload as failed
    if (chunk.retryCount >= 3) {
      session.stage = "failed";
      session.error = `Chunk ${chunkIndex} failed after 3 retries: ${error}`;
    }

    this.emitProgress(session);
  }

  /**
   * Complete upload session
   */
  completeSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    session.stage = "completed";
    session.lastActivity = Date.now();

    console.log(`Upload session completed: ${uploadId}`);
    this.emitProgress(session);

    // Clean up after a delay
    setTimeout(() => {
      this.removeSession(uploadId);
    }, 5000);
  }

  /**
   * Fail upload session
   */
  failSession(uploadId: string, error: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    session.stage = "failed";
    session.error = error;
    session.lastActivity = Date.now();

    console.log(`Upload session failed: ${uploadId} - ${error}`);
    this.emitProgress(session);
  }

  /**
   * Get upload progress
   */
  getProgress(uploadId: string): UploadProgress | null {
    const session = this.sessions.get(uploadId);
    if (!session) return null;

    return this.calculateProgress(session);
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): UploadProgress[] {
    return Array.from(this.sessions.values()).map((session) =>
      this.calculateProgress(session)
    );
  }

  /**
   * Add progress callback
   */
  addProgressCallback(uploadId: string, callback: ProgressCallback): void {
    const callbacks = this.progressCallbacks.get(uploadId) || [];
    callbacks.push(callback);
    this.progressCallbacks.set(uploadId, callbacks);
  }

  /**
   * Remove progress callback
   */
  removeProgressCallback(uploadId: string, callback: ProgressCallback): void {
    const callbacks = this.progressCallbacks.get(uploadId) || [];
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.progressCallbacks.set(uploadId, callbacks);
    }
  }

  /**
   * Remove upload session
   */
  removeSession(uploadId: string): void {
    this.sessions.delete(uploadId);
    this.progressCallbacks.delete(uploadId);
    console.log(`Removed upload session: ${uploadId}`);
  }

  /**
   * Pause upload session
   */
  pauseSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    session.stage = "preparing"; // Paused state
    session.lastActivity = Date.now();

    console.log(`Upload session paused: ${uploadId}`);
    this.emitProgress(session);
  }

  /**
   * Resume upload session
   */
  resumeSession(uploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    session.stage = "uploading";
    session.lastActivity = Date.now();

    console.log(`Upload session resumed: ${uploadId}`);
    this.emitProgress(session);
  }

  /**
   * Get retry chunks for failed upload
   */
  getRetryChunks(uploadId: string): UploadChunk[] {
    const session = this.sessions.get(uploadId);
    if (!session) return [];

    return session.chunks.filter((chunk) => !chunk.uploaded);
  }

  /**
   * Set multipart upload ID
   */
  setMultipartUploadId(uploadId: string, multipartUploadId: string): void {
    const session = this.sessions.get(uploadId);
    if (!session) return;

    session.multipartUploadId = multipartUploadId;
  }

  /**
   * Get multipart upload ID
   */
  getMultipartUploadId(uploadId: string): string | undefined {
    const session = this.sessions.get(uploadId);
    return session?.multipartUploadId;
  }

  /**
   * Calculate progress metrics
   */
  private calculateProgress(session: UploadSession): UploadProgress {
    const completedChunks = session.chunks.filter((c) => c.uploaded).length;
    const percentage =
      session.totalSize > 0
        ? (session.uploadedSize / session.totalSize) * 100
        : 0;
    const elapsed = Date.now() - session.startTime;
    const speed = elapsed > 0 ? (session.uploadedSize / elapsed) * 1000 : 0; // bytes per second
    const remainingBytes = session.totalSize - session.uploadedSize;
    const timeRemaining = speed > 0 ? remainingBytes / speed : 0;

    return {
      uploadId: session.uploadId,
      filename: session.filename,
      totalSize: session.totalSize,
      uploadedSize: session.uploadedSize,
      percentage: Math.round(percentage * 100) / 100,
      speed: Math.round(speed),
      timeRemaining: Math.round(timeRemaining),
      stage: session.stage,
      error: session.error,
      startTime: session.startTime,
      lastUpdate: session.lastActivity,
      chunkSize: session.chunkSize,
      completedChunks,
      totalChunks: session.chunks.length,
    };
  }

  /**
   * Emit progress event
   */
  private emitProgress(session: UploadSession): void {
    const progress = this.calculateProgress(session);

    // Emit global event
    this.emit("progress", progress);

    // Call specific callbacks
    const callbacks = this.progressCallbacks.get(session.uploadId) || [];
    callbacks.forEach((callback) => {
      try {
        callback(progress);
      } catch (error) {
        console.error("Error in progress callback:", error);
      }
    });
  }

  /**
   * Setup cleanup interval for old sessions
   */
  private setupCleanupInterval(): void {
    this.cleanupInterval = setInterval(
      () => {
        const now = Date.now();

        for (const [uploadId, session] of this.sessions) {
          if (now - session.lastActivity > this.SESSION_TIMEOUT) {
            console.log(`Cleaning up inactive session: ${uploadId}`);
            this.removeSession(uploadId);
          }
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.sessions.clear();
    this.progressCallbacks.clear();
    this.removeAllListeners();
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    total: number;
    active: number;
    completed: number;
    failed: number;
    totalSize: number;
    uploadedSize: number;
  } {
    const sessions = Array.from(this.sessions.values());

    return {
      total: sessions.length,
      active: sessions.filter((s) => s.stage === "uploading").length,
      completed: sessions.filter((s) => s.stage === "completed").length,
      failed: sessions.filter((s) => s.stage === "failed").length,
      totalSize: sessions.reduce((sum, s) => sum + s.totalSize, 0),
      uploadedSize: sessions.reduce((sum, s) => sum + s.uploadedSize, 0),
    };
  }
}

// Export singleton instance
export const uploadProgressTracker = new UploadProgressTracker();

// Utility functions
export const createUploadSession = (
  uploadId: string,
  filename: string,
  totalSize: number,
  chunkSize: number = 5 * 1024 * 1024, // 5MB default
  key: string,
  contentType: string,
  metadata: Record<string, string> = {}
): UploadSession => {
  return uploadProgressTracker.createSession(
    uploadId,
    filename,
    totalSize,
    chunkSize,
    key,
    contentType,
    metadata
  );
};

export const trackUploadProgress = (
  uploadId: string,
  callback: ProgressCallback
): void => {
  uploadProgressTracker.addProgressCallback(uploadId, callback);
};

export const getUploadProgress = (uploadId: string): UploadProgress | null => {
  return uploadProgressTracker.getProgress(uploadId);
};

export const getAllUploadProgress = (): UploadProgress[] => {
  return uploadProgressTracker.getActiveSessions();
};

// Helper functions for formatting
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatSpeed = (bytesPerSecond: number): string => {
  return `${formatBytes(bytesPerSecond)}/s`;
};

export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
};
