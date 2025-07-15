"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, Zap } from "lucide-react";
import { VideoCreationWizard } from "@/components/wizard/video-creation-wizard";

export default function CreateVideoPage() {
  const [showWizard, setShowWizard] = useState(false);
  const router = useRouter();

  const handleStartCreating = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = async (data: any) => {
    console.log("Video creation completed:", data);
    // Redirect to library or video details page
    router.push("/dashboard/library");
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  if (showWizard) {
    return (
      <div className="p-6">
        <VideoCreationWizard
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
          sessionId={`create_${Date.now()}`}
        />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Create Viral Video
        </h1>
        <p className="text-muted-foreground text-lg">
          Turn trending topics into engaging videos with AI-powered generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary" />
              Video Creation Wizard
            </CardTitle>
            <CardDescription>
              Follow our step-by-step process to generate your viral video
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Select Trending Topic</h3>
                    <p className="text-sm text-muted-foreground">
                      Choose from viral content
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-muted-foreground">
                      2
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Customize Style
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Set tone and format
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-muted-foreground">
                      3
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground">
                      Generate & Review
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      AI creates your video
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <Button 
              className="w-full mt-6 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
              onClick={handleStartCreating}
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Creating
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-orange-500" />
              Success Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>
                  Choose trending topics with high viral scores for maximum
                  reach
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Keep videos between 15-30 seconds for optimal engagement</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Use clear, compelling hooks in the first 3 seconds</p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Include trending hashtags and keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
