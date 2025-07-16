"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TestTube,
  Play,
  Square,
  RotateCcw,
  Download,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  HardDrive,
} from "lucide-react";
import { useClips, useEffects, useTextOverlays, useAudioTracks } from "@/lib/stores/video-editor-store";

export interface PerformanceTestConfig {
  clipCount: number;
  trackCount: number;
  effectsPerClip: number;
  textOverlayCount: number;
  audioTrackCount: number;
  projectDuration: number;
  testDuration: number; // seconds
  testType: "stress" | "endurance" | "memory" | "render";
}

export interface TestResult {
  id: string;
  config: PerformanceTestConfig;
  startTime: number;
  endTime?: number;
  metrics: {
    avgFps: number;
    minFps: number;
    maxFps: number;
    avgMemory: number;
    maxMemory: number;
    avgCpu: number;
    maxCpu: number;
    avgRenderTime: number;
    maxRenderTime: number;
    errorCount: number;
    successRate: number;
  };
  issues: string[];
  status: "running" | "completed" | "failed" | "cancelled";
}

export interface PerformanceTestPanelProps {
  /** Callback when test results are available */
  onTestComplete?: (result: TestResult) => void;
  /** Current performance metrics */
  currentMetrics?: any;
  /** Custom CSS class */
  className?: string;
}

const predefinedTests = {
  light: {
    clipCount: 5,
    trackCount: 3,
    effectsPerClip: 1,
    textOverlayCount: 2,
    audioTrackCount: 1,
    projectDuration: 30,
    testDuration: 30,
    testType: "stress" as const,
  },
  medium: {
    clipCount: 20,
    trackCount: 5,
    effectsPerClip: 3,
    textOverlayCount: 8,
    audioTrackCount: 3,
    projectDuration: 120,
    testDuration: 60,
    testType: "stress" as const,
  },
  heavy: {
    clipCount: 50,
    trackCount: 8,
    effectsPerClip: 5,
    textOverlayCount: 20,
    audioTrackCount: 5,
    projectDuration: 300,
    testDuration: 120,
    testType: "endurance" as const,
  },
  extreme: {
    clipCount: 100,
    trackCount: 12,
    effectsPerClip: 8,
    textOverlayCount: 50,
    audioTrackCount: 10,
    projectDuration: 600,
    testDuration: 300,
    testType: "memory" as const,
  },
};

export const PerformanceTestPanel = ({
  onTestComplete,
  currentMetrics,
  className,
}: PerformanceTestPanelProps) => {
  const [testConfig, setTestConfig] = useState<PerformanceTestConfig>(predefinedTests.medium);
  const [currentTest, setCurrentTest] = useState<TestResult | null>(null);
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testProgress, setTestProgress] = useState(0);

  const { addClip, removeClip, clips } = useClips();
  const { addEffect } = useEffects();
  const { addTextOverlay } = useTextOverlays();
  const { addAudioTrack } = useAudioTracks();

  // Generate test project data
  const generateTestProject = useCallback((config: PerformanceTestConfig) => {
    const clips = [];
    const effects = [];
    const textOverlays = [];
    const audioTracks = [];

    // Generate clips
    for (let i = 0; i < config.clipCount; i++) {
      const startTime = (i * config.projectDuration) / config.clipCount;
      const duration = config.projectDuration / config.clipCount;
      
      clips.push({
        id: `test-clip-${i}`,
        url: `/api/placeholder/video/test-${i % 5}.mp4`,
        startTime,
        endTime: startTime + duration,
        duration,
        volume: 0.8 + Math.random() * 0.4,
        effects: [],
      });

      // Add effects to this clip
      for (let j = 0; j < config.effectsPerClip; j++) {
        effects.push({
          id: `test-effect-${i}-${j}`,
          type: ["filter", "transition"][j % 2] as "filter" | "transition",
          name: `Test Effect ${j + 1}`,
          parameters: { intensity: Math.random() },
          startTime: startTime + (j * duration / config.effectsPerClip),
          duration: duration / config.effectsPerClip,
          enabled: true,
        });
      }
    }

    // Generate text overlays
    for (let i = 0; i < config.textOverlayCount; i++) {
      textOverlays.push({
        id: `test-text-${i}`,
        text: `Test Text Overlay ${i + 1}`,
        startTime: (i * config.projectDuration) / config.textOverlayCount,
        duration: 5,
        position: { x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 },
        style: {
          fontSize: 24 + Math.random() * 20,
          fontFamily: "Arial",
          color: "#ffffff",
          bold: Math.random() > 0.5,
          italic: Math.random() > 0.7,
        },
      });
    }

    // Generate audio tracks
    for (let i = 0; i < config.audioTrackCount; i++) {
      audioTracks.push({
        id: `test-audio-${i}`,
        url: `/api/placeholder/audio/test-${i}.mp3`,
        type: ["background", "voiceover", "sfx"][i % 3] as "background" | "voiceover" | "sfx",
        volume: 0.5 + Math.random() * 0.5,
        startTime: 0,
        duration: config.projectDuration,
      });
    }

    return { clips, effects, textOverlays, audioTracks };
  }, []);

  // Run performance test
  const runTest = useCallback(async (config: PerformanceTestConfig) => {
    const testId = `test-${Date.now()}`;
    const startTime = Date.now();

    const testResult: TestResult = {
      id: testId,
      config,
      startTime,
      metrics: {
        avgFps: 0,
        minFps: 60,
        maxFps: 0,
        avgMemory: 0,
        maxMemory: 0,
        avgCpu: 0,
        maxCpu: 0,
        avgRenderTime: 0,
        maxRenderTime: 0,
        errorCount: 0,
        successRate: 100,
      },
      issues: [],
      status: "running",
    };

    setCurrentTest(testResult);
    setIsRunning(true);
    setTestProgress(0);

    try {
      // Generate and load test project
      const projectData = generateTestProject(config);
      
      // Simulate loading the project into the editor
      console.log("Loading test project:", {
        clips: projectData.clips.length,
        effects: projectData.effects.length,
        textOverlays: projectData.textOverlays.length,
        audioTracks: projectData.audioTracks.length,
      });

      // Simulate test execution with metrics collection
      const metricsCollected: any[] = [];
      const testDurationMs = config.testDuration * 1000;
      const intervalMs = 100;
      const totalIntervals = testDurationMs / intervalMs;

      for (let i = 0; i < totalIntervals; i++) {
        if (!isRunning) break; // Allow cancellation

        // Simulate performance metrics based on project complexity
        const complexity = (config.clipCount + config.effectsPerClip * config.clipCount + config.textOverlayCount) / 100;
        const baseLoad = Math.min(80, complexity * 50);
        const variance = Math.random() * 20 - 10;

        const metrics = {
          fps: Math.max(15, 60 - baseLoad - variance),
          memory: Math.max(100, 200 + complexity * 300 + variance * 50),
          cpu: Math.max(10, 20 + baseLoad + variance),
          renderTime: Math.max(8, 16 + complexity * 20 + variance * 2),
          timestamp: Date.now(),
        };

        metricsCollected.push(metrics);

        // Update progress
        setTestProgress((i / totalIntervals) * 100);

        // Simulate real-time delay
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }

      // Calculate final metrics
      if (metricsCollected.length > 0) {
        const fpsValues = metricsCollected.map(m => m.fps);
        const memoryValues = metricsCollected.map(m => m.memory);
        const cpuValues = metricsCollected.map(m => m.cpu);
        const renderTimeValues = metricsCollected.map(m => m.renderTime);

        testResult.metrics = {
          avgFps: fpsValues.reduce((a, b) => a + b) / fpsValues.length,
          minFps: Math.min(...fpsValues),
          maxFps: Math.max(...fpsValues),
          avgMemory: memoryValues.reduce((a, b) => a + b) / memoryValues.length,
          maxMemory: Math.max(...memoryValues),
          avgCpu: cpuValues.reduce((a, b) => a + b) / cpuValues.length,
          maxCpu: Math.max(...cpuValues),
          avgRenderTime: renderTimeValues.reduce((a, b) => a + b) / renderTimeValues.length,
          maxRenderTime: Math.max(...renderTimeValues),
          errorCount: fpsValues.filter(fps => fps < 15).length,
          successRate: ((fpsValues.filter(fps => fps >= 30).length / fpsValues.length) * 100),
        };
      }

      // Detect issues
      const issues = [];
      if (testResult.metrics.avgFps < 30) issues.push("Average FPS below 30");
      if (testResult.metrics.minFps < 15) issues.push("Minimum FPS critically low");
      if (testResult.metrics.maxMemory > 1000) issues.push("Memory usage exceeded 1GB");
      if (testResult.metrics.maxCpu > 80) issues.push("CPU usage exceeded 80%");
      if (testResult.metrics.avgRenderTime > 33) issues.push("Render time too slow for real-time playback");

      testResult.issues = issues;
      testResult.endTime = Date.now();
      testResult.status = "completed";

      setCurrentTest(testResult);
      setTestHistory(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 tests
      onTestComplete?.(testResult);

    } catch (error) {
      testResult.status = "failed";
      testResult.issues.push(`Test failed: ${error}`);
      setCurrentTest(testResult);
    } finally {
      setIsRunning(false);
      setTestProgress(100);
    }
  }, [generateTestProject, isRunning, onTestComplete]);

  const cancelTest = useCallback(() => {
    setIsRunning(false);
    if (currentTest) {
      setCurrentTest({
        ...currentTest,
        status: "cancelled",
        endTime: Date.now(),
      });
    }
  }, [currentTest]);

  const resetTests = useCallback(() => {
    setCurrentTest(null);
    setTestHistory([]);
    setTestProgress(0);
  }, []);

  const exportResults = useCallback(() => {
    const data = {
      tests: testHistory,
      exportTime: new Date().toISOString(),
      summary: {
        totalTests: testHistory.length,
        successfulTests: testHistory.filter(t => t.status === "completed").length,
        avgPerformanceScore: testHistory.length > 0 
          ? testHistory.reduce((sum, test) => sum + test.metrics.successRate, 0) / testHistory.length 
          : 0,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-test-results-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [testHistory]);

  const updateConfig = (updates: Partial<PerformanceTestConfig>) => {
    setTestConfig(prev => ({ ...prev, ...updates }));
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "running": return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "cancelled": return <Square className="h-4 w-4 text-gray-500" />;
      default: return <TestTube className="h-4 w-4" />;
    }
  };

  const getPerformanceGrade = (successRate: number) => {
    if (successRate >= 95) return { grade: "A", color: "text-green-600" };
    if (successRate >= 85) return { grade: "B", color: "text-green-500" };
    if (successRate >= 75) return { grade: "C", color: "text-yellow-500" };
    if (successRate >= 65) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>Performance Testing</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={resetTests}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            {testHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={exportResults}>
                <Download className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Test Configuration */}
        <div>
          <h4 className="text-sm font-medium mb-3">Test Configuration</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="test-preset" className="text-sm">Preset</Label>
              <Select onValueChange={(value) => setTestConfig(predefinedTests[value as keyof typeof predefinedTests])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light Project</SelectItem>
                  <SelectItem value="medium">Medium Project</SelectItem>
                  <SelectItem value="heavy">Heavy Project</SelectItem>
                  <SelectItem value="extreme">Extreme Project</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="test-type" className="text-sm">Test Type</Label>
              <Select value={testConfig.testType} onValueChange={(value: any) => updateConfig({ testType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stress">Stress Test</SelectItem>
                  <SelectItem value="endurance">Endurance Test</SelectItem>
                  <SelectItem value="memory">Memory Test</SelectItem>
                  <SelectItem value="render">Render Test</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clip-count" className="text-sm">Clips</Label>
              <Input
                id="clip-count"
                type="number"
                value={testConfig.clipCount}
                onChange={(e) => updateConfig({ clipCount: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="effects-per-clip" className="text-sm">Effects per Clip</Label>
              <Input
                id="effects-per-clip"
                type="number"
                value={testConfig.effectsPerClip}
                onChange={(e) => updateConfig({ effectsPerClip: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="text-overlays" className="text-sm">Text Overlays</Label>
              <Input
                id="text-overlays"
                type="number"
                value={testConfig.textOverlayCount}
                onChange={(e) => updateConfig({ textOverlayCount: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="test-duration" className="text-sm">Test Duration (s)</Label>
              <Input
                id="test-duration"
                type="number"
                value={testConfig.testDuration}
                onChange={(e) => updateConfig({ testDuration: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Test Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => runTest(testConfig)}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Run Test</span>
            </Button>
            {isRunning && (
              <Button
                variant="outline"
                onClick={cancelTest}
                className="flex items-center space-x-2"
              >
                <Square className="h-4 w-4" />
                <span>Cancel</span>
              </Button>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            Estimated complexity: {(testConfig.clipCount + testConfig.effectsPerClip * testConfig.clipCount + testConfig.textOverlayCount) / 10} / 10
          </div>
        </div>

        {/* Test Progress */}
        {isRunning && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Test Progress</span>
              <span className="text-sm text-muted-foreground">{testProgress.toFixed(0)}%</span>
            </div>
            <Progress value={testProgress} className="h-2" />
          </div>
        )}

        {/* Current Test Results */}
        {currentTest && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                {getStatusIcon(currentTest.status)}
                <span>Current Test Results</span>
                <Badge variant={currentTest.status === "completed" ? "default" : 
                              currentTest.status === "failed" ? "destructive" : "secondary"}>
                  {currentTest.status}
                </Badge>
              </h4>

              {currentTest.status === "completed" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Avg FPS:</span>
                      <span className="text-sm font-medium">{currentTest.metrics.avgFps.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Min FPS:</span>
                      <span className="text-sm font-medium">{currentTest.metrics.minFps.toFixed(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Max Memory:</span>
                      <span className="text-sm font-medium">{currentTest.metrics.maxMemory.toFixed(0)}MB</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Max CPU:</span>
                      <span className="text-sm font-medium">{currentTest.metrics.maxCpu.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate:</span>
                      <span className={cn("text-sm font-medium", getPerformanceGrade(currentTest.metrics.successRate).color)}>
                        {currentTest.metrics.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Grade:</span>
                      <span className={cn("text-sm font-bold", getPerformanceGrade(currentTest.metrics.successRate).color)}>
                        {getPerformanceGrade(currentTest.metrics.successRate).grade}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentTest.issues.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-muted-foreground mb-2">Issues Detected:</h5>
                  <div className="space-y-1">
                    {currentTest.issues.map((issue, index) => (
                      <div key={index} className="text-xs text-red-600 flex items-center space-x-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Test History */}
        {testHistory.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3">Test History</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {testHistory.map((test) => {
                  const grade = getPerformanceGrade(test.metrics.successRate);
                  return (
                    <div key={test.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(test.status)}
                        <span className="text-sm">
                          {test.config.clipCount} clips, {test.config.effectsPerClip} effects/clip
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {test.metrics.avgFps.toFixed(1)} FPS
                        </span>
                        <span className={cn("text-sm font-bold", grade.color)}>
                          {grade.grade}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceTestPanel;