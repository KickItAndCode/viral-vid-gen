"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Music,
  Volume2,
  VolumeX,
  Mic,
  Zap,
  Upload,
  Download,
  Play,
  Pause,
  RotateCcw,
  Settings,
  Sliders,
  Headphones,
  Layers,
  Plus,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AudioTrack,
  useVideoEditorStore,
} from "@/lib/stores/video-editor-store";

interface AudioControlsPanelProps {
  className?: string;
}

interface AudioEffect {
  id: string;
  name: string;
  type:
    | "equalizer"
    | "reverb"
    | "delay"
    | "chorus"
    | "distortion"
    | "noise-reduction";
  parameters: Record<string, number>;
  enabled: boolean;
}

const AUDIO_EFFECTS: Omit<AudioEffect, "id" | "enabled">[] = [
  {
    name: "Equalizer",
    type: "equalizer",
    parameters: {
      lowGain: 0,
      midGain: 0,
      highGain: 0,
      lowFreq: 100,
      midFreq: 1000,
      highFreq: 8000,
    },
  },
  {
    name: "Reverb",
    type: "reverb",
    parameters: {
      roomSize: 0.5,
      damping: 0.5,
      wetLevel: 0.3,
      dryLevel: 0.7,
    },
  },
  {
    name: "Delay",
    type: "delay",
    parameters: {
      delayTime: 0.3,
      feedback: 0.4,
      mixLevel: 0.25,
    },
  },
  {
    name: "Noise Reduction",
    type: "noise-reduction",
    parameters: {
      threshold: -40,
      ratio: 4,
      attack: 0.1,
      release: 0.25,
    },
  },
];

export function AudioControlsPanel({ className }: AudioControlsPanelProps) {
  const audioTracks = useVideoEditorStore((state) => state.audioTracks);
  const addAudioTrack = useVideoEditorStore((state) => state.addAudioTrack);
  const removeAudioTrack = useVideoEditorStore(
    (state) => state.removeAudioTrack
  );
  const updateAudioTrack = useVideoEditorStore(
    (state) => state.updateAudioTrack
  );

  const [masterVolume, setMasterVolume] = useState(0.8);
  const [masterMuted, setMasterMuted] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [audioEffects, setAudioEffects] = useState<AudioEffect[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const audioUrl = URL.createObjectURL(file);
    const trackId = `audio-${Date.now()}`;

    // Create audio element to get duration
    const audio = new Audio(audioUrl);
    audio.addEventListener("loadedmetadata", () => {
      const newTrack: Omit<AudioTrack, "id"> = {
        url: audioUrl,
        type: "background",
        volume: 0.7,
        startTime: 0,
        duration: audio.duration,
        fadeIn: 0,
        fadeOut: 0,
      };

      addAudioTrack(newTrack);
      setSelectedTrack(trackId);
    });
  };

  const handleTrackVolumeChange = (trackId: string, volume: number) => {
    updateAudioTrack(trackId, { volume });
  };

  const handleTrackTypeChange = (trackId: string, type: AudioTrack["type"]) => {
    updateAudioTrack(trackId, { type });
  };

  const handleFadeChange = (
    trackId: string,
    fadeType: "fadeIn" | "fadeOut",
    value: number
  ) => {
    updateAudioTrack(trackId, { [fadeType]: value });
  };

  const addAudioEffect = (effectType: AudioEffect["type"]) => {
    const effectTemplate = AUDIO_EFFECTS.find((e) => e.type === effectType);
    if (!effectTemplate) return;

    const newEffect: AudioEffect = {
      id: `effect-${Date.now()}`,
      enabled: true,
      ...effectTemplate,
    };

    setAudioEffects([...audioEffects, newEffect]);
  };

  const removeAudioEffect = (effectId: string) => {
    setAudioEffects(audioEffects.filter((e) => e.id !== effectId));
  };

  const toggleAudioEffect = (effectId: string) => {
    setAudioEffects(
      audioEffects.map((e) =>
        e.id === effectId ? { ...e, enabled: !e.enabled } : e
      )
    );
  };

  const updateEffectParameter = (
    effectId: string,
    parameter: string,
    value: number
  ) => {
    setAudioEffects(
      audioEffects.map((e) =>
        e.id === effectId
          ? { ...e, parameters: { ...e.parameters, [parameter]: value } }
          : e
      )
    );
  };

  const getTrackTypeColor = (type: AudioTrack["type"]) => {
    switch (type) {
      case "background":
        return "bg-blue-100 text-blue-800";
      case "voiceover":
        return "bg-green-100 text-green-800";
      case "sfx":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const selectedTrackData = audioTracks.find((t) => t.id === selectedTrack);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Headphones className="h-5 w-5 mr-2" />
          Audio Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="tracks" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tracks">Tracks</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="mixer">Mixer</TabsTrigger>
          </TabsList>

          <TabsContent value="tracks" className="space-y-4">
            {/* Master Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Master Volume</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMasterMuted(!masterMuted)}
                >
                  {masterMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => setMasterVolume(value[0])}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
              <div className="text-xs text-muted-foreground text-right">
                {Math.round(masterVolume * 100)}%
              </div>
            </div>

            <Separator />

            {/* Audio Track Upload */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Audio Tracks</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add Track
                </Button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Audio Tracks List */}
            <div className="space-y-3">
              {audioTracks.map((track) => (
                <Card
                  key={track.id}
                  className={cn(
                    "p-3 transition-colors cursor-pointer",
                    selectedTrack === track.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedTrack(track.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={getTrackTypeColor(track.type)}
                        >
                          {track.type}
                        </Badge>
                        <span className="text-sm font-medium">{track.id}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeAudioTrack(track.id);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Type
                        </Label>
                        <Select
                          value={track.type}
                          onValueChange={(value) =>
                            handleTrackTypeChange(
                              track.id,
                              value as AudioTrack["type"]
                            )
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="background">
                              Background
                            </SelectItem>
                            <SelectItem value="voiceover">Voiceover</SelectItem>
                            <SelectItem value="sfx">Sound Effect</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Duration
                        </Label>
                        <div className="text-sm font-medium">
                          {formatTime(track.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">
                        Volume
                      </Label>
                      <Slider
                        value={[track.volume]}
                        onValueChange={(value) =>
                          handleTrackVolumeChange(track.id, value[0])
                        }
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {Math.round(track.volume * 100)}%
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Fade In (s)
                        </Label>
                        <Input
                          type="number"
                          value={track.fadeIn || 0}
                          onChange={(e) =>
                            handleFadeChange(
                              track.id,
                              "fadeIn",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={10}
                          step={0.1}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Fade Out (s)
                        </Label>
                        <Input
                          type="number"
                          value={track.fadeOut || 0}
                          onChange={(e) =>
                            handleFadeChange(
                              track.id,
                              "fadeOut",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          min={0}
                          max={10}
                          step={0.1}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {audioTracks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audio tracks added yet</p>
                  <p className="text-sm">
                    Click "Add Track" to upload audio files
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            {/* Add Effects */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Add Audio Effects</Label>
              <div className="grid grid-cols-2 gap-2">
                {AUDIO_EFFECTS.map((effect) => (
                  <Button
                    key={effect.type}
                    variant="outline"
                    size="sm"
                    onClick={() => addAudioEffect(effect.type)}
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {effect.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Applied Effects */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Applied Effects</Label>
              {audioEffects.map((effect) => (
                <Card key={effect.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={effect.enabled ? "default" : "secondary"}
                        >
                          {effect.name}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleAudioEffect(effect.id)}
                        >
                          {effect.enabled ? "Disable" : "Enable"}
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAudioEffect(effect.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {effect.enabled && (
                      <div className="space-y-2">
                        {Object.entries(effect.parameters).map(
                          ([param, value]) => (
                            <div key={param} className="space-y-1">
                              <Label className="text-xs text-muted-foreground">
                                {param.charAt(0).toUpperCase() + param.slice(1)}
                              </Label>
                              <Slider
                                value={[value]}
                                onValueChange={(newValue) =>
                                  updateEffectParameter(
                                    effect.id,
                                    param,
                                    newValue[0]
                                  )
                                }
                                min={effect.type === "equalizer" ? -20 : 0}
                                max={effect.type === "equalizer" ? 20 : 1}
                                step={0.1}
                                className="w-full"
                              />
                              <div className="text-xs text-muted-foreground text-right">
                                {value.toFixed(1)}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {audioEffects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Sliders className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audio effects applied</p>
                  <p className="text-sm">Add effects to enhance your audio</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mixer" className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Audio Mixer</Label>

              {/* Master Bus */}
              <Card className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Master Bus</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setMasterMuted(!masterMuted)}
                    >
                      {masterMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-xs text-muted-foreground w-8">0</div>
                    <Slider
                      value={[masterVolume]}
                      onValueChange={(value) => setMasterVolume(value[0])}
                      min={0}
                      max={1}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="text-xs text-muted-foreground w-8">100</div>
                  </div>
                </div>
              </Card>

              {/* Individual Track Mixers */}
              {audioTracks.map((track) => (
                <Card key={track.id} className="p-3">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={getTrackTypeColor(track.type)}
                        >
                          {track.type}
                        </Badge>
                        <span className="text-sm font-medium">{track.id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(track.volume * 100)}%
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-xs text-muted-foreground w-8">0</div>
                      <Slider
                        value={[track.volume]}
                        onValueChange={(value) =>
                          handleTrackVolumeChange(track.id, value[0])
                        }
                        min={0}
                        max={1}
                        step={0.1}
                        className="flex-1"
                      />
                      <div className="text-xs text-muted-foreground w-8">
                        100
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
