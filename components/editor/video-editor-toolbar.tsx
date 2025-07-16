"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Save,
  Download,
  Undo,
  Redo,
  Scissors,
  Copy,
  Trash2,
  Upload,
  FileVideo,
  FileAudio,
  FileImage,
  Type,
  ChevronDown,
  Settings,
  Share,
  Home,
  Activity,
} from "lucide-react";
import { useRouter } from "next/navigation";

export interface VideoEditorToolbarProps {
  /** Callback for save action */
  onSave?: () => void;
  /** Callback for export action */
  onExport?: () => void;
  /** Callback for performance dashboard */
  onPerformance?: () => void;
  /** Callback for undo action */
  onUndo?: () => void;
  /** Callback for redo action */
  onRedo?: () => void;
  /** Whether undo is available */
  canUndo?: boolean;
  /** Whether redo is available */
  canRedo?: boolean;
  /** Custom CSS class */
  className?: string;
}

export const VideoEditorToolbar = ({
  onSave,
  onExport,
  onPerformance,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className,
}: VideoEditorToolbarProps) => {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport?.();
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = (type: string) => {
    console.log(`Importing ${type}...`);
    // Implement import functionality
  };

  return (
    <div
      className={cn(
        "h-14 px-4 flex items-center justify-between bg-background border-b border-border",
        className
      )}
    >
      {/* Left Section - Navigation & File Operations */}
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="text-muted-foreground"
        >
          <Home className="h-4 w-4 mr-2" />
          Dashboard
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => handleImport("video")}>
              <FileVideo className="h-4 w-4 mr-2" />
              Video File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleImport("audio")}>
              <FileAudio className="h-4 w-4 mr-2" />
              Audio File
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleImport("image")}>
              <FileImage className="h-4 w-4 mr-2" />
              Image File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isExporting}
        >
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </div>

      {/* Center Section - Edit Tools */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" title="Split Clip (S)">
          <Scissors className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" title="Copy (Ctrl+C)">
          <Copy className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" title="Paste (Ctrl+V)">
          <Copy className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" title="Delete (Delete)">
          <Trash2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="outline" size="sm" title="Add Text">
          <Type className="h-4 w-4" />
        </Button>
      </div>

      {/* Right Section - Project Actions */}
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" title="Share Project">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>

        <Button
          variant="outline"
          size="sm"
          title="Performance Dashboard"
          onClick={onPerformance}
        >
          <Activity className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="sm" title="Project Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default VideoEditorToolbar;
