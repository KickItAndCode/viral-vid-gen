"use client";

import React, { useState, useEffect } from "react";
import { WizardStepProps } from "../types";
import { WizardStepWrapper } from "../wizard-step-wrapper";
import { TrendGrid } from "@/components/trends/trend-grid";
import { TrendPreview } from "@/components/trends/trend-preview";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTrends } from "@/hooks/use-trends";
import {
  TrendingUp,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendSelectionStepProps extends WizardStepProps {}

export function TrendSelectionStep(props: TrendSelectionStepProps) {
  const { wizardData, onDataChange } = props;
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(
    wizardData.selectedTrend?.id || null
  );
  const [showPreview, setShowPreview] = useState(false);
  const [previewTrend, setPreviewTrend] = useState<any>(null);

  // Get trends data with proper type assertion
  const trendsResult = useTrends() as {
    data: any[];
    isLoading: boolean;
    isError: boolean;
    refetch: () => void;
  };

  const { data: trends = [], isLoading, isError, refetch } = trendsResult;

  // Update step validation when selection changes
  useEffect(() => {
    const isValid = !!selectedTrendId;
    if (props.step.isValid !== isValid) {
      // Update step validation (this would be handled by the wizard container)
    }
  }, [selectedTrendId, props.step]);

  const handleTrendSelect = (trend: any) => {
    setSelectedTrendId(trend._id);

    // Update wizard data
    onDataChange("trend-selection", {
      selectedTrend: {
        id: trend._id,
        title: trend.title,
        description: trend.description,
        platform: trend.platform,
        category: trend.category,
        viralScore: trend.viralScore,
        tags: trend.tags,
        engagementMetrics: trend.engagementMetrics,
      },
    });
  };

  const handleTrendPreview = (trend: any) => {
    setPreviewTrend(trend);
    setShowPreview(true);
  };

  const handlePreviewClose = () => {
    setShowPreview(false);
    setPreviewTrend(null);
  };

  const handlePreviewSelect = () => {
    if (previewTrend) {
      handleTrendSelect(previewTrend);
      handlePreviewClose();
    }
  };

  const selectedTrend = trends.find(
    (trend: any) => trend._id === selectedTrendId
  );

  if (isError) {
    return (
      <WizardStepWrapper step={props.step}>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <TrendingUp className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Failed to Load Trends
            </h3>
            <p className="text-red-700 mb-4">
              Unable to fetch trending content. Please try again.
            </p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </WizardStepWrapper>
    );
  }

  return (
    <WizardStepWrapper step={props.step}>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">
              Choose Your Trending Topic
            </h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select a trending topic to base your video on. Higher viral scores
            indicate content with better engagement potential.
          </p>
        </div>

        {/* Selected Trend Display */}
        {selectedTrend && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Selected Trend
                </CardTitle>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  Viral Score: {selectedTrend.viralScore}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h3 className="font-semibold text-green-800">
                  {selectedTrend.title}
                </h3>
                <p className="text-green-700 text-sm">
                  {selectedTrend.description}
                </p>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedTrend.platform}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {selectedTrend.category}
                  </Badge>
                  {selectedTrend.tags.slice(0, 2).map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Search className="h-4 w-4 text-blue-500" />
              <span className="font-medium">Search & Filter</span>
            </div>
            <p className="text-muted-foreground">
              Use the search bar and filters to find relevant trending topics
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="font-medium">Viral Score</span>
            </div>
            <p className="text-muted-foreground">
              Higher scores (80+) indicate content with viral potential
            </p>
          </Card>

          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Filter className="h-4 w-4 text-purple-500" />
              <span className="font-medium">Preview Details</span>
            </div>
            <p className="text-muted-foreground">
              Click any trend card to see detailed metrics and preview
            </p>
          </Card>
        </div>

        {/* Trend Grid */}
        <div className="min-h-[500px]">
          <TrendGrid
            trends={trends}
            isLoading={isLoading}
            onTrendSelect={handleTrendSelect}
            onTrendPreview={handleTrendPreview}
            selectedTrendId={selectedTrendId}
            className="h-full"
            showSelectionMode={true}
            selectionVariant="wizard"
          />
        </div>

        {/* Trend Preview Modal */}
        {showPreview && previewTrend && (
          <TrendPreview
            trend={previewTrend}
            isOpen={showPreview}
            onClose={handlePreviewClose}
            onSelect={handlePreviewSelect}
            showSelectButton={true}
            selectButtonText="Use This Trend"
          />
        )}

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            💡 <strong>Tip:</strong> Choose trends with high engagement and
            recent activity for the best results. You can change your selection
            at any time.
          </p>
        </div>
      </div>
    </WizardStepWrapper>
  );
}
