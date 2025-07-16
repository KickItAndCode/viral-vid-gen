"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  cpuUsage: number;
  renderTime: number;
  clipCount: number;
  trackCount: number;
  effectCount: number;
  timelineZoom: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  fps: { good: number; warning: number };
  memory: { good: number; warning: number };
  cpu: { good: number; warning: number };
  renderTime: { good: number; warning: number };
}

export interface PerformanceMonitorProps {
  /** Current project metrics */
  metrics?: Partial<PerformanceMetrics>;
  /** Whether monitoring is active */
  isActive?: boolean;
  /** Callback when performance issues detected */
  onPerformanceIssue?: (issue: string, severity: "low" | "medium" | "high") => void;
  /** Custom CSS class */
  className?: string;
}

const defaultThresholds: PerformanceThresholds = {
  fps: { good: 30, warning: 15 },
  memory: { good: 500, warning: 1000 }, // MB
  cpu: { good: 50, warning: 80 }, // %
  renderTime: { good: 16, warning: 33 }, // ms (60fps = 16ms, 30fps = 33ms)
};

export const PerformanceMonitor = ({
  metrics = {},
  isActive = true,
  onPerformanceIssue,
  className,
}: PerformanceMonitorProps) => {
  const [isMonitoring, setIsMonitoring] = useState(isActive);
  const [currentMetrics, setCurrentMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    cpuUsage: 0,
    renderTime: 16,
    clipCount: 0,
    trackCount: 3,
    effectCount: 0,
    timelineZoom: 1,
    timestamp: Date.now(),
  });
  const [metricsHistory, setMetricsHistory] = useState<PerformanceMetrics[]>([]);
  const [performanceScore, setPerformanceScore] = useState(100);
  const [issues, setIssues] = useState<Array<{ message: string; severity: "low" | "medium" | "high" }>>([]);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const frameCountRef = useRef(0);
  const lastFrameTimeRef = useRef(performance.now());

  // Simulate performance metrics for development
  const simulateMetrics = useCallback(() => {
    const baseLoad = Math.max(0, (currentMetrics.clipCount * 5) + (currentMetrics.effectCount * 10));
    const randomVariance = () => (Math.random() - 0.5) * 10;

    return {
      fps: Math.max(15, 60 - baseLoad + randomVariance()),
      memoryUsage: Math.max(100, 200 + (currentMetrics.clipCount * 50) + (currentMetrics.effectCount * 25) + randomVariance() * 50),
      cpuUsage: Math.max(10, 20 + baseLoad + randomVariance()),
      renderTime: Math.max(8, 16 + (baseLoad * 0.5) + randomVariance()),
      clipCount: metrics.clipCount || currentMetrics.clipCount,
      trackCount: metrics.trackCount || currentMetrics.trackCount,
      effectCount: metrics.effectCount || currentMetrics.effectCount,
      timelineZoom: metrics.timelineZoom || currentMetrics.timelineZoom,
      timestamp: Date.now(),
    };
  }, [currentMetrics, metrics]);

  // Calculate performance score
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics) => {
    let score = 100;
    
    // FPS penalty
    if (metrics.fps < defaultThresholds.fps.warning) score -= 30;
    else if (metrics.fps < defaultThresholds.fps.good) score -= 15;
    
    // Memory penalty
    if (metrics.memoryUsage > defaultThresholds.memory.warning) score -= 25;
    else if (metrics.memoryUsage > defaultThresholds.memory.good) score -= 10;
    
    // CPU penalty
    if (metrics.cpuUsage > defaultThresholds.cpu.warning) score -= 25;
    else if (metrics.cpuUsage > defaultThresholds.cpu.good) score -= 10;
    
    // Render time penalty
    if (metrics.renderTime > defaultThresholds.renderTime.warning) score -= 20;
    else if (metrics.renderTime > defaultThresholds.renderTime.good) score -= 10;
    
    return Math.max(0, score);
  }, []);

  // Detect performance issues
  const detectIssues = useCallback((metrics: PerformanceMetrics) => {
    const newIssues: Array<{ message: string; severity: "low" | "medium" | "high" }> = [];
    
    if (metrics.fps < defaultThresholds.fps.warning) {
      newIssues.push({
        message: `Low frame rate: ${metrics.fps.toFixed(1)} FPS`,
        severity: "high"
      });
    } else if (metrics.fps < defaultThresholds.fps.good) {
      newIssues.push({
        message: `Reduced frame rate: ${metrics.fps.toFixed(1)} FPS`,
        severity: "medium"
      });
    }
    
    if (metrics.memoryUsage > defaultThresholds.memory.warning) {
      newIssues.push({
        message: `High memory usage: ${metrics.memoryUsage.toFixed(0)} MB`,
        severity: "high"
      });
    } else if (metrics.memoryUsage > defaultThresholds.memory.good) {
      newIssues.push({
        message: `Elevated memory usage: ${metrics.memoryUsage.toFixed(0)} MB`,
        severity: "medium"
      });
    }
    
    if (metrics.cpuUsage > defaultThresholds.cpu.warning) {
      newIssues.push({
        message: `High CPU usage: ${metrics.cpuUsage.toFixed(1)}%`,
        severity: "high"
      });
    } else if (metrics.cpuUsage > defaultThresholds.cpu.good) {
      newIssues.push({
        message: `Elevated CPU usage: ${metrics.cpuUsage.toFixed(1)}%`,
        severity: "medium"
      });
    }
    
    if (metrics.renderTime > defaultThresholds.renderTime.warning) {
      newIssues.push({
        message: `Slow render time: ${metrics.renderTime.toFixed(1)}ms`,
        severity: "high"
      });
    }
    
    // Complex project warnings
    if (metrics.clipCount > 20) {
      newIssues.push({
        message: `Large number of clips: ${metrics.clipCount}`,
        severity: "low"
      });
    }
    
    if (metrics.effectCount > 50) {
      newIssues.push({
        message: `Many effects applied: ${metrics.effectCount}`,
        severity: "medium"
      });
    }
    
    setIssues(newIssues);
    
    // Notify callback of new issues
    newIssues.forEach(issue => {
      onPerformanceIssue?.(issue.message, issue.severity);
    });
  }, [onPerformanceIssue]);

  // Update metrics
  useEffect(() => {
    if (!isMonitoring) return;

    intervalRef.current = setInterval(() => {
      const newMetrics = simulateMetrics();
      setCurrentMetrics(newMetrics);
      
      // Add to history (keep last 60 data points)
      setMetricsHistory(prev => {
        const updated = [...prev, newMetrics];
        return updated.slice(-60);
      });
      
      // Calculate performance score
      const score = calculatePerformanceScore(newMetrics);
      setPerformanceScore(score);
      
      // Detect issues
      detectIssues(newMetrics);
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isMonitoring, simulateMetrics, calculatePerformanceScore, detectIssues]);

  // Update current metrics when props change
  useEffect(() => {
    setCurrentMetrics(prev => ({
      ...prev,
      ...metrics,
      timestamp: Date.now(),
    }));
  }, [metrics]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
  };

  const resetMetrics = () => {
    setMetricsHistory([]);
    setIssues([]);
    setPerformanceScore(100);
  };

  const getMetricStatus = (value: number, thresholds: { good: number; warning: number }, reverse = false) => {
    if (reverse) {
      if (value >= thresholds.good) return "good";
      if (value >= thresholds.warning) return "warning";
      return "critical";
    } else {
      if (value <= thresholds.good) return "good";
      if (value <= thresholds.warning) return "warning";
      return "critical";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "critical": return "text-red-600";
      default: return "text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "good": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical": return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: "A", color: "text-green-600" };
    if (score >= 80) return { grade: "B", color: "text-green-500" };
    if (score >= 70) return { grade: "C", color: "text-yellow-500" };
    if (score >= 60) return { grade: "D", color: "text-orange-500" };
    return { grade: "F", color: "text-red-500" };
  };

  const { grade, color } = getPerformanceGrade(performanceScore);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Performance Monitor</span>
            <Badge variant={isMonitoring ? "default" : "secondary"}>
              {isMonitoring ? "Active" : "Paused"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMonitoring}
            >
              {isMonitoring ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetMetrics}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Performance Score */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-sm text-muted-foreground">Performance Score</span>
            <span className={cn("text-2xl font-bold", color)}>
              {grade}
            </span>
          </div>
          <Progress value={performanceScore} className="h-2" />
          <span className="text-xs text-muted-foreground">
            {performanceScore.toFixed(0)}/100
          </span>
        </div>

        <Separator />

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">FPS</span>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(getMetricStatus(currentMetrics.fps, defaultThresholds.fps, true))}
                <span className={cn("text-sm font-medium", getStatusColor(getMetricStatus(currentMetrics.fps, defaultThresholds.fps, true)))}>
                  {currentMetrics.fps.toFixed(1)}
                </span>
              </div>
            </div>
            <Progress value={(currentMetrics.fps / 60) * 100} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4" />
                <span className="text-sm">Memory</span>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(getMetricStatus(currentMetrics.memoryUsage, defaultThresholds.memory))}
                <span className={cn("text-sm font-medium", getStatusColor(getMetricStatus(currentMetrics.memoryUsage, defaultThresholds.memory)))}>
                  {currentMetrics.memoryUsage.toFixed(0)}MB
                </span>
              </div>
            </div>
            <Progress value={Math.min(100, (currentMetrics.memoryUsage / 1000) * 100)} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4" />
                <span className="text-sm">CPU</span>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(getMetricStatus(currentMetrics.cpuUsage, defaultThresholds.cpu))}
                <span className={cn("text-sm font-medium", getStatusColor(getMetricStatus(currentMetrics.cpuUsage, defaultThresholds.cpu)))}>
                  {currentMetrics.cpuUsage.toFixed(1)}%
                </span>
              </div>
            </div>
            <Progress value={currentMetrics.cpuUsage} className="h-1" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Render</span>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(getMetricStatus(currentMetrics.renderTime, defaultThresholds.renderTime))}
                <span className={cn("text-sm font-medium", getStatusColor(getMetricStatus(currentMetrics.renderTime, defaultThresholds.renderTime)))}>
                  {currentMetrics.renderTime.toFixed(1)}ms
                </span>
              </div>
            </div>
            <Progress value={Math.min(100, (currentMetrics.renderTime / 50) * 100)} className="h-1" />
          </div>
        </div>

        <Separator />

        {/* Project Complexity */}
        <div>
          <h4 className="text-sm font-medium mb-3">Project Complexity</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{currentMetrics.clipCount}</div>
              <div className="text-xs text-muted-foreground">Clips</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentMetrics.trackCount}</div>
              <div className="text-xs text-muted-foreground">Tracks</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{currentMetrics.effectCount}</div>
              <div className="text-xs text-muted-foreground">Effects</div>
            </div>
          </div>
        </div>

        {/* Performance Issues */}
        {issues.length > 0 && (
          <>
            <Separator />
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Performance Issues</span>
              </h4>
              <div className="space-y-2">
                {issues.map((issue, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-2 rounded-md border text-sm",
                      issue.severity === "high" ? "border-red-200 bg-red-50 text-red-700" :
                      issue.severity === "medium" ? "border-yellow-200 bg-yellow-50 text-yellow-700" :
                      "border-blue-200 bg-blue-50 text-blue-700"
                    )}
                  >
                    {issue.message}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;