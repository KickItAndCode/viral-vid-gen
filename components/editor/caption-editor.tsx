"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Type,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Move,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  RotateCcw,
  Play,
  Pause,
  Clock,
  Layers,
} from "lucide-react";
import {
  useTextOverlays,
  useTimeline,
  usePlayback,
} from "@/lib/stores/video-editor-store";

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline";
  color: string;
  backgroundColor?: string;
  backgroundOpacity: number;
  textAlign: "left" | "center" | "right";
  letterSpacing: number;
  lineHeight: number;
  textShadow: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
  };
  stroke: {
    enabled: boolean;
    color: string;
    width: number;
  };
}

export interface CaptionItem {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
  style: CaptionStyle;
  animation?: {
    type:
      | "fade-in"
      | "slide-up"
      | "slide-down"
      | "slide-left"
      | "slide-right"
      | "zoom-in"
      | "zoom-out"
      | "typewriter";
    duration: number;
    delay: number;
    easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear";
  };
  isVisible: boolean;
  isLocked: boolean;
}

export interface CaptionEditorProps {
  /** Current video duration */
  duration: number;
  /** Custom CSS class */
  className?: string;
}

const defaultCaptionStyle: CaptionStyle = {
  fontFamily: "Arial, sans-serif",
  fontSize: 32,
  fontWeight: "bold",
  fontStyle: "normal",
  textDecoration: "none",
  color: "#ffffff",
  backgroundColor: "#000000",
  backgroundOpacity: 0,
  textAlign: "center",
  letterSpacing: 0,
  lineHeight: 1.2,
  textShadow: {
    enabled: true,
    color: "#000000",
    blur: 2,
    offsetX: 1,
    offsetY: 1,
  },
  stroke: {
    enabled: false,
    color: "#000000",
    width: 1,
  },
};

const fontFamilies = [
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
  "Trebuchet MS, sans-serif",
  "Palatino, serif",
  "Garamond, serif",
  "Bookman, serif",
  "Comic Sans MS, cursive",
  "Impact, sans-serif",
  "Lucida Console, monospace",
  "Tahoma, sans-serif",
];

const animationTypes = [
  { value: "fade-in", label: "Fade In" },
  { value: "slide-up", label: "Slide Up" },
  { value: "slide-down", label: "Slide Down" },
  { value: "slide-left", label: "Slide Left" },
  { value: "slide-right", label: "Slide Right" },
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
  { value: "typewriter", label: "Typewriter" },
];

const presetStyles = {
  modern: {
    ...defaultCaptionStyle,
    fontFamily: "Helvetica, sans-serif",
    fontSize: 36,
    fontWeight: "bold" as const,
    color: "#ffffff",
    backgroundColor: "#000000",
    backgroundOpacity: 0.7,
    textShadow: {
      enabled: false,
      color: "#000000",
      blur: 0,
      offsetX: 0,
      offsetY: 0,
    },
  },
  classic: {
    ...defaultCaptionStyle,
    fontFamily: "Times New Roman, serif",
    fontSize: 28,
    fontWeight: "normal" as const,
    color: "#ffffff",
    backgroundColor: "#000000",
    backgroundOpacity: 0.8,
    textShadow: {
      enabled: true,
      color: "#000000",
      blur: 2,
      offsetX: 1,
      offsetY: 1,
    },
  },
  bold: {
    ...defaultCaptionStyle,
    fontFamily: "Impact, sans-serif",
    fontSize: 40,
    fontWeight: "bold" as const,
    color: "#ffff00",
    backgroundColor: "#000000",
    backgroundOpacity: 0.5,
    stroke: { enabled: true, color: "#000000", width: 2 },
  },
  minimal: {
    ...defaultCaptionStyle,
    fontFamily: "Arial, sans-serif",
    fontSize: 24,
    fontWeight: "normal" as const,
    color: "#ffffff",
    backgroundColor: undefined,
    backgroundOpacity: 0,
    textShadow: {
      enabled: true,
      color: "#000000",
      blur: 4,
      offsetX: 2,
      offsetY: 2,
    },
  },
};

export const CaptionEditor = ({ duration, className }: CaptionEditorProps) => {
  const [selectedCaptionId, setSelectedCaptionId] = useState<string | null>(
    null
  );
  const [editingStyle, setEditingStyle] =
    useState<CaptionStyle>(defaultCaptionStyle);
  const [previewMode, setPreviewMode] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  const { textOverlays, addTextOverlay, removeTextOverlay, updateTextOverlay } =
    useTextOverlays();
  const { timeline, setCurrentTime } = useTimeline();
  const { currentTime, isPlaying, play, pause } = usePlayback();

  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  // Convert text overlays to caption items
  const captions: CaptionItem[] = textOverlays.map((overlay) => ({
    id: overlay.id,
    text: overlay.text,
    startTime: overlay.startTime,
    endTime: overlay.startTime + overlay.duration,
    position: overlay.position,
    style: {
      ...defaultCaptionStyle,
      fontFamily: overlay.style.fontFamily,
      fontSize: overlay.style.fontSize,
      fontWeight: overlay.style.bold ? "bold" : "normal",
      fontStyle: overlay.style.italic ? "italic" : "normal",
      color: overlay.style.color,
      backgroundColor: overlay.style.backgroundColor,
    },
    animation: overlay.animation
      ? {
          type: overlay.animation,
          duration: 0.5,
          delay: 0,
          easing: "ease-in-out",
        }
      : undefined,
    isVisible: true,
    isLocked: false,
  }));

  const selectedCaption = captions.find((c) => c.id === selectedCaptionId);

  const addCaption = useCallback(() => {
    const newCaption = {
      text: "New Caption",
      startTime: currentTime,
      duration: 3,
      position: { x: 50, y: 80 }, // Center bottom
      style: {
        fontSize: editingStyle.fontSize,
        fontFamily: editingStyle.fontFamily,
        color: editingStyle.color,
        backgroundColor: editingStyle.backgroundColor,
        bold: editingStyle.fontWeight === "bold",
        italic: editingStyle.fontStyle === "italic",
      },
      animation: "fade-in" as const,
    };

    addTextOverlay(newCaption);
  }, [currentTime, editingStyle, addTextOverlay]);

  const duplicateCaption = useCallback(
    (captionId: string) => {
      const caption = captions.find((c) => c.id === captionId);
      if (!caption) return;

      const newCaption = {
        text: caption.text + " (Copy)",
        startTime: caption.endTime,
        duration: caption.endTime - caption.startTime,
        position: { x: caption.position.x + 5, y: caption.position.y + 5 },
        style: {
          fontSize: caption.style.fontSize,
          fontFamily: caption.style.fontFamily,
          color: caption.style.color,
          backgroundColor: caption.style.backgroundColor,
          bold: caption.style.fontWeight === "bold",
          italic: caption.style.fontStyle === "italic",
        },
        animation: caption.animation?.type as any,
      };

      addTextOverlay(newCaption);
    },
    [captions, addTextOverlay]
  );

  const updateCaptionText = useCallback(
    (captionId: string, text: string) => {
      updateTextOverlay(captionId, { text });
    },
    [updateTextOverlay]
  );

  const updateCaptionTiming = useCallback(
    (captionId: string, startTime: number, endTime: number) => {
      updateTextOverlay(captionId, {
        startTime,
        duration: endTime - startTime,
      });
    },
    [updateTextOverlay]
  );

  const updateCaptionPosition = useCallback(
    (captionId: string, position: { x: number; y: number }) => {
      updateTextOverlay(captionId, { position });
    },
    [updateTextOverlay]
  );

  const updateCaptionStyle = useCallback(
    (captionId: string, style: Partial<CaptionStyle>) => {
      const caption = captions.find((c) => c.id === captionId);
      if (!caption) return;

      const updatedStyle = {
        fontSize: style.fontSize || caption.style.fontSize,
        fontFamily: style.fontFamily || caption.style.fontFamily,
        color: style.color || caption.style.color,
        backgroundColor: style.backgroundColor || caption.style.backgroundColor,
        bold: style.fontWeight === "bold",
        italic: style.fontStyle === "italic",
      };

      updateTextOverlay(captionId, { style: updatedStyle });
    },
    [captions, updateTextOverlay]
  );

  const applyPresetStyle = useCallback(
    (preset: keyof typeof presetStyles) => {
      if (!selectedCaptionId) return;

      const presetStyle = presetStyles[preset];
      setEditingStyle(presetStyle);
      updateCaptionStyle(selectedCaptionId, presetStyle);
    },
    [selectedCaptionId, updateCaptionStyle]
  );

  const handleCaptionDrag = useCallback(
    (captionId: string, event: React.MouseEvent) => {
      if (!previewRef.current) return;

      const rect = previewRef.current.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;

      dragRef.current = { isDragging: true, startX, startY };

      const handleMouseMove = (e: MouseEvent) => {
        if (!dragRef.current.isDragging || !previewRef.current) return;

        const rect = previewRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        updateCaptionPosition(captionId, {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        });
      };

      const handleMouseUp = () => {
        dragRef.current.isDragging = false;
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [updateCaptionPosition]
  );

  const getVisibleCaptions = useCallback(() => {
    return captions.filter(
      (caption) =>
        currentTime >= caption.startTime && currentTime <= caption.endTime
    );
  }, [captions, currentTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const generateCaptionCSS = (style: CaptionStyle) => {
    const css: React.CSSProperties = {
      fontFamily: style.fontFamily,
      fontSize: `${style.fontSize}px`,
      fontWeight: style.fontWeight,
      fontStyle: style.fontStyle,
      textDecoration: style.textDecoration,
      color: style.color,
      textAlign: style.textAlign,
      letterSpacing: `${style.letterSpacing}px`,
      lineHeight: style.lineHeight,
      userSelect: "none",
      cursor: "move",
      position: "absolute",
      transform: "translate(-50%, -50%)",
      zIndex: 10,
      pointerEvents: "auto",
    };

    if (style.backgroundColor && style.backgroundOpacity > 0) {
      css.backgroundColor = style.backgroundColor;
      css.opacity = style.backgroundOpacity;
      css.padding = "4px 8px";
      css.borderRadius = "4px";
    }

    if (style.textShadow.enabled) {
      css.textShadow = `${style.textShadow.offsetX}px ${style.textShadow.offsetY}px ${style.textShadow.blur}px ${style.textShadow.color}`;
    }

    if (style.stroke.enabled) {
      css.WebkitTextStroke = `${style.stroke.width}px ${style.stroke.color}`;
    }

    return css;
  };

  return (
    <Card className={cn("w-full h-full flex flex-col", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="h-5 w-5" />
            <span>Caption Editor</span>
            <Badge variant="outline">{captions.length} captions</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              {previewMode ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={addCaption}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Preview Area */}
        <div className="relative bg-black rounded-lg aspect-video">
          <div
            ref={previewRef}
            className="absolute inset-0 overflow-hidden rounded-lg"
            style={{ backgroundColor: "#000000" }}
          >
            {/* Video preview placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-white/50">
              <div className="text-center">
                <Play className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm">Video Preview</p>
                <p className="text-xs">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* Captions Overlay */}
            {getVisibleCaptions().map((caption) => (
              <div
                key={caption.id}
                className={cn(
                  "absolute transition-all duration-200",
                  selectedCaptionId === caption.id
                    ? "ring-2 ring-blue-500"
                    : "",
                  caption.isVisible ? "opacity-100" : "opacity-50"
                )}
                style={{
                  left: `${caption.position.x}%`,
                  top: `${caption.position.y}%`,
                  ...generateCaptionCSS(caption.style),
                }}
                onMouseDown={(e) => handleCaptionDrag(caption.id, e)}
                onClick={() => setSelectedCaptionId(caption.id)}
              >
                {caption.text}
              </div>
            ))}
          </div>

          {/* Playback Controls */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isPlaying ? pause : play}
              className="bg-black/50 border-white/20 text-white hover:bg-black/70"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <div className="flex-1 bg-white/20 rounded-full h-2 relative">
              <div
                className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <span className="text-white text-xs">
              {formatTime(currentTime)}
            </span>
          </div>
        </div>

        {/* Caption List */}
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {captions.map((caption) => (
            <div
              key={caption.id}
              className={cn(
                "p-3 rounded-lg border cursor-pointer transition-all",
                selectedCaptionId === caption.id
                  ? "border-blue-500 bg-blue-50"
                  : "border-border hover:border-blue-300"
              )}
              onClick={() => setSelectedCaptionId(caption.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Input
                    value={caption.text}
                    onChange={(e) =>
                      updateCaptionText(caption.id, e.target.value)
                    }
                    className="border-none p-0 h-auto bg-transparent focus:ring-0"
                    placeholder="Enter caption text..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateCaption(caption.id);
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTextOverlay(caption.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                <span>
                  {formatTime(caption.startTime)} →{" "}
                  {formatTime(caption.endTime)}
                </span>
                <span>{(caption.endTime - caption.startTime).toFixed(1)}s</span>
                <span>
                  ({caption.position.x.toFixed(0)}%,{" "}
                  {caption.position.y.toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Style Panel */}
        {selectedCaption && showStylePanel && (
          <div className="space-y-4">
            <Separator />

            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Style Settings</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Presets:</span>
                {Object.keys(presetStyles).map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      applyPresetStyle(preset as keyof typeof presetStyles)
                    }
                    className="capitalize"
                  >
                    {preset}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="font-family" className="text-sm">
                  Font Family
                </Label>
                <Select
                  value={editingStyle.fontFamily}
                  onValueChange={(value) =>
                    setEditingStyle((prev) => ({ ...prev, fontFamily: value }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontFamilies.map((font) => (
                      <SelectItem key={font} value={font}>
                        <span style={{ fontFamily: font }}>
                          {font.split(",")[0]}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="font-size" className="text-sm">
                  Font Size
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Slider
                    value={[editingStyle.fontSize]}
                    onValueChange={([value]) =>
                      setEditingStyle((prev) => ({ ...prev, fontSize: value }))
                    }
                    max={72}
                    min={12}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-10 text-right">
                    {editingStyle.fontSize}px
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="text-color" className="text-sm">
                  Text Color
                </Label>
                <div className="flex items-center space-x-2 mt-1">
                  <Input
                    type="color"
                    value={editingStyle.color}
                    onChange={(e) =>
                      setEditingStyle((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="w-12 h-8 p-0 border-none"
                  />
                  <Input
                    value={editingStyle.color}
                    onChange={(e) =>
                      setEditingStyle((prev) => ({
                        ...prev,
                        color: e.target.value,
                      }))
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text-align" className="text-sm">
                  Alignment
                </Label>
                <div className="flex items-center space-x-1 mt-1">
                  <Button
                    variant={
                      editingStyle.textAlign === "left" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setEditingStyle((prev) => ({
                        ...prev,
                        textAlign: "left",
                      }))
                    }
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      editingStyle.textAlign === "center"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setEditingStyle((prev) => ({
                        ...prev,
                        textAlign: "center",
                      }))
                    }
                  >
                    <AlignCenter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={
                      editingStyle.textAlign === "right" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      setEditingStyle((prev) => ({
                        ...prev,
                        textAlign: "right",
                      }))
                    }
                  >
                    <AlignRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  variant={
                    editingStyle.fontWeight === "bold" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setEditingStyle((prev) => ({
                      ...prev,
                      fontWeight:
                        prev.fontWeight === "bold" ? "normal" : "bold",
                    }))
                  }
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    editingStyle.fontStyle === "italic" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setEditingStyle((prev) => ({
                      ...prev,
                      fontStyle:
                        prev.fontStyle === "italic" ? "normal" : "italic",
                    }))
                  }
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant={
                    editingStyle.textDecoration === "underline"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setEditingStyle((prev) => ({
                      ...prev,
                      textDecoration:
                        prev.textDecoration === "underline"
                          ? "none"
                          : "underline",
                    }))
                  }
                >
                  <Underline className="h-4 w-4" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-6" />

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (selectedCaptionId) {
                      updateCaptionStyle(selectedCaptionId, editingStyle);
                    }
                  }}
                >
                  Apply Style
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingStyle(defaultCaptionStyle)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Timing Controls */}
            <div>
              <Label className="text-sm">Timing</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <Label htmlFor="start-time" className="text-xs">
                    Start Time
                  </Label>
                  <Input
                    id="start-time"
                    type="number"
                    value={selectedCaption.startTime.toFixed(2)}
                    onChange={(e) => {
                      const startTime = parseFloat(e.target.value);
                      updateCaptionTiming(
                        selectedCaption.id,
                        startTime,
                        selectedCaption.endTime
                      );
                    }}
                    step="0.1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end-time" className="text-xs">
                    End Time
                  </Label>
                  <Input
                    id="end-time"
                    type="number"
                    value={selectedCaption.endTime.toFixed(2)}
                    onChange={(e) => {
                      const endTime = parseFloat(e.target.value);
                      updateCaptionTiming(
                        selectedCaption.id,
                        selectedCaption.startTime,
                        endTime
                      );
                    }}
                    step="0.1"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaptionEditor;
