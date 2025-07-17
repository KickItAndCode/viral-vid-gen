"use client";

import { Breadcrumb } from "@/components/layout";
import { MVPVideoLibrary } from "@/components/library/mvp-video-library";

export default function LibraryPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">My Videos</h1>
        <p className="text-muted-foreground text-lg">
          View and manage your generated videos
        </p>
      </div>

      <MVPVideoLibrary />
    </div>
  );
}