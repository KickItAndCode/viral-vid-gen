"use client";

import { useState } from "react";
import { Breadcrumb } from "@/components/layout";
import { VideoEditorWorkspace } from "@/components/editor";

export default function EditorPage() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <Breadcrumb />
        <div className="mt-2">
          <h1 className="text-2xl font-bold text-foreground">Video Editor</h1>
          <p className="text-sm text-muted-foreground">
            Professional video editing workspace
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <VideoEditorWorkspace
          videoId={currentVideoId}
          onVideoLoad={setCurrentVideoId}
        />
      </div>
    </div>
  );
}
