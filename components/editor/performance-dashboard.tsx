"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  TestTube,
  TrendingUp,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { PerformanceMonitor } from "./performance-monitor";
import { PerformanceTestPanel } from "./performance-test-panel";
import {
  useClips,
  useEffects,
  useTextOverlays,
  useAudioTracks,
  useTimeline,
} from "@/lib/stores/video-editor-store";

export interface PerformanceDashboardProps {
  /** Whether the dashboard is visible */
  isOpen?: boolean;
  /** Callback when dashboard is closed */
  onClose?: () => void;
  /** Custom CSS class */
  className?: string;
}

interface PerformanceRecommendation {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  category: "memory" | "cpu" | "rendering" | "optimization";
  action?: string;
}

export const PerformanceDashboard = ({
  isOpen = true,
  onClose,
  className,
}: PerformanceDashboardProps) => {
  const [activeTab, setActiveTab] = useState("monitor");
  const [performanceIssues, setPerformanceIssues] = useState<string[]>([]);
  const [recommendations, setRecommendations] = useState<
    PerformanceRecommendation[]
  >([]);
  const [testResults, setTestResults] = useState<any[]>([]);

  const { clips } = useClips();
  const { clips: clipsWithEffects } = useEffects();
  const { textOverlays } = useTextOverlays();
  const { audioTracks } = useAudioTracks();
  const { timeline } = useTimeline();

  // Calculate current project metrics
  const projectMetrics = {
    clipCount: clips.length,
    trackCount: 3, // Default tracks
    effectCount: clipsWithEffects.reduce(
      (total, clip) => total + clip.effects.length,
      0
    ),
    textOverlayCount: textOverlays.length,
    audioTrackCount: audioTracks.length,
    timelineZoom: timeline.zoom,
    projectComplexity: clips.length + textOverlays.length + audioTracks.length,
  };

  // Generate performance recommendations based on current project
  const generateRecommendations = useCallback(() => {
    const newRecommendations: PerformanceRecommendation[] = [];

    // Check clip count
    if (projectMetrics.clipCount > 30) {
      newRecommendations.push({
        id: "high-clip-count",
        title: "High Clip Count",
        description: `Your project has ${projectMetrics.clipCount} clips. Consider organizing them into nested sequences or pre-rendering some sections.`,
        severity: projectMetrics.clipCount > 50 ? "high" : "medium",
        category: "memory",
        action: "Organize clips into sequences",
      });
    }

    // Check effect usage
    if (projectMetrics.effectCount > 20) {
      newRecommendations.push({
        id: "many-effects",
        title: "Heavy Effect Usage",
        description: `${projectMetrics.effectCount} effects are applied. Consider pre-rendering clips with complex effects.`,
        severity: projectMetrics.effectCount > 40 ? "high" : "medium",
        category: "rendering",
        action: "Pre-render complex effects",
      });
    }

    // Check text overlays
    if (projectMetrics.textOverlayCount > 15) {
      newRecommendations.push({
        id: "many-overlays",
        title: "Multiple Text Overlays",
        description: `${projectMetrics.textOverlayCount} text overlays may impact performance. Consider using simpler animations.`,
        severity: "medium",
        category: "rendering",
        action: "Simplify text animations",
      });
    }

    // Timeline zoom recommendations
    if (timeline.zoom > 5) {
      newRecommendations.push({
        id: "high-zoom",
        title: "High Timeline Zoom",
        description:
          "Very high zoom levels can impact timeline performance. Consider lower zoom for better responsiveness.",
        severity: "low",
        category: "optimization",
        action: "Reduce timeline zoom",
      });
    }

    // Memory optimization
    if (projectMetrics.clipCount > 20 || projectMetrics.effectCount > 15) {
      newRecommendations.push({
        id: "memory-optimization",
        title: "Memory Optimization",
        description:
          "Consider enabling proxy media for better performance with large projects.",
        severity: "medium",
        category: "memory",
        action: "Enable proxy media",
      });
    }

    // General optimization
    if (projectMetrics.projectComplexity > 40) {
      newRecommendations.push({
        id: "complex-project",
        title: "Complex Project Detected",
        description:
          "This is a complex project. Consider breaking it into smaller sections for better performance.",
        severity: "medium",
        category: "optimization",
        action: "Break into sections",
      });
    }

    setRecommendations(newRecommendations);
  }, [projectMetrics, timeline.zoom]);

  // Update recommendations when project changes
  useEffect(() => {
    generateRecommendations();
  }, [generateRecommendations]);

  // Handle performance issues from monitor
  const handlePerformanceIssue = useCallback(
    (issue: string, severity: "low" | "medium" | "high") => {
      setPerformanceIssues((prev) => {
        const newIssues = [...prev, `${severity.toUpperCase()}: ${issue}`];
        return newIssues.slice(-10); // Keep last 10 issues
      });
    },
    []
  );

  // Handle test completion
  const handleTestComplete = useCallback((result: any) => {
    setTestResults((prev) => [result, ...prev.slice(0, 4)]); // Keep last 5 results

    // Switch to monitor tab to show results
    setActiveTab("monitor");
  }, []);

  // Export performance report
  const exportReport = useCallback(() => {
    const report = {
      timestamp: new Date().toISOString(),
      projectMetrics,
      recommendations,
      recentIssues: performanceIssues,
      testResults,
      summary: {
        projectComplexity: projectMetrics.projectComplexity,
        riskLevel: recommendations.some((r) => r.severity === "high")
          ? "high"
          : recommendations.some((r) => r.severity === "medium")
            ? "medium"
            : "low",
        recommendationCount: recommendations.length,
        testCount: testResults.length,
      },
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [projectMetrics, recommendations, performanceIssues, testResults]);

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getCategoryIcon = (category: PerformanceRecommendation["category"]) => {
    switch (category) {
      case "memory":
        return <Activity className="h-4 w-4" />;
      case "cpu":
        return <TrendingUp className="h-4 w-4" />;
      case "rendering":
        return <Settings className="h-4 w-4" />;
      case "optimization":
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Performance Dashboard</span>
              <Badge variant="outline">
                {projectMetrics.clipCount} clips, {projectMetrics.effectCount}{" "}
                effects
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={exportReport}>
                <Download className="h-4 w-4" />
              </Button>
              {onClose && (
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="monitor">Monitor</TabsTrigger>
              <TabsTrigger value="testing">Testing</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="space-y-4">
              <PerformanceMonitor
                metrics={projectMetrics}
                onPerformanceIssue={handlePerformanceIssue}
              />

              {performanceIssues.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>Recent Performance Issues</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {performanceIssues.slice(-5).map((issue, index) => (
                        <div
                          key={index}
                          className="text-xs text-muted-foreground"
                        >
                          {issue}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <PerformanceTestPanel
                onTestComplete={handleTestComplete}
                currentMetrics={projectMetrics}
              />
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No performance issues detected!</p>
                      <p className="text-xs">
                        Your project is optimized for good performance.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className={cn(
                            "p-3 rounded-lg border",
                            getSeverityColor(rec.severity)
                          )}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getCategoryIcon(rec.category)}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium">
                                {rec.title}
                              </h4>
                              <p className="text-xs mt-1">{rec.description}</p>
                              {rec.action && (
                                <div className="mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    💡 {rec.action}
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <Badge
                              variant={
                                rec.severity === "high"
                                  ? "destructive"
                                  : rec.severity === "medium"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {rec.severity}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Project Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Project Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Total Clips:</span>
                        <span className="text-sm font-medium">
                          {projectMetrics.clipCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Applied Effects:</span>
                        <span className="text-sm font-medium">
                          {projectMetrics.effectCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Text Overlays:</span>
                        <span className="text-sm font-medium">
                          {projectMetrics.textOverlayCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Audio Tracks:</span>
                        <span className="text-sm font-medium">
                          {projectMetrics.audioTrackCount}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-sm">Complexity Score:</span>
                        <span className="text-sm font-medium">
                          {projectMetrics.projectComplexity}/100
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Performance Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Risk Level:</span>
                        <Badge
                          variant={
                            recommendations.some((r) => r.severity === "high")
                              ? "destructive"
                              : recommendations.some(
                                    (r) => r.severity === "medium"
                                  )
                                ? "default"
                                : "secondary"
                          }
                        >
                          {recommendations.some((r) => r.severity === "high")
                            ? "High"
                            : recommendations.some(
                                  (r) => r.severity === "medium"
                                )
                              ? "Medium"
                              : "Low"}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recommendations:</span>
                        <span className="text-sm font-medium">
                          {recommendations.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Tests Run:</span>
                        <span className="text-sm font-medium">
                          {testResults.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Recent Issues:</span>
                        <span className="text-sm font-medium">
                          {performanceIssues.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Test Results */}
              {testResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Recent Test Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {testResults.slice(0, 3).map((result, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 rounded border"
                        >
                          <div className="flex items-center space-x-2">
                            <TestTube className="h-4 w-4" />
                            <span className="text-sm">
                              {result.config.clipCount} clips test
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {result.metrics.avgFps?.toFixed(1)} FPS avg
                            </span>
                            <Badge
                              variant={
                                result.metrics.successRate > 80
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {result.metrics.successRate?.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceDashboard;
