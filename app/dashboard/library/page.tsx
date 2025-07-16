"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Breadcrumb } from "@/components/layout";
import { VideoLibraryGrid } from "@/components/library";
import type {
  VideoLibraryItem,
  VideoLibraryFiltersType as VideoLibraryFilters,
  VideoLibrarySortOption,
} from "@/components/library";

// Mock data for development
const mockVideos: VideoLibraryItem[] = [
  {
    id: "1",
    title: "AI Productivity Hacks",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 24,
    status: "completed",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    fileSize: 12500000, // 12.5MB
    viralScore: 8.7,
    views: 15420,
    likes: 892,
    shares: 234,
    platform: "tiktok",
    style: "modern",
    aiProvider: "veo",
    tags: ["productivity", "AI", "tech"],
    description:
      "Boost your productivity with these AI-powered tips and tricks",
  },
  {
    id: "2",
    title: "Sustainable Living Tips",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 18,
    status: "completed",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    fileSize: 9800000, // 9.8MB
    viralScore: 7.9,
    views: 8934,
    likes: 567,
    shares: 123,
    platform: "youtube",
    style: "cinematic",
    aiProvider: "runway",
    tags: ["sustainability", "lifestyle", "eco-friendly"],
    description: "Easy ways to make your lifestyle more sustainable",
  },
  {
    id: "3",
    title: "Remote Work Setup",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 22,
    status: "processing",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    fileSize: 0,
    viralScore: 0,
    views: 0,
    likes: 0,
    shares: 0,
    platform: "instagram",
    style: "professional",
    aiProvider: "luma",
    tags: ["work", "remote", "setup"],
    description: "Create the perfect remote work environment",
    progress: 60,
  },
  {
    id: "4",
    title: "Healthy Cooking Made Easy",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 30,
    status: "completed",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fileSize: 18200000, // 18.2MB
    viralScore: 9.1,
    views: 23456,
    likes: 1234,
    shares: 567,
    platform: "tiktok",
    style: "vibrant",
    aiProvider: "veo",
    tags: ["cooking", "healthy", "food"],
    description: "Quick and healthy recipes for busy people",
  },
  {
    id: "5",
    title: "Travel Photography Tips",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 27,
    status: "completed",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    fileSize: 15600000, // 15.6MB
    viralScore: 8.3,
    views: 12789,
    likes: 743,
    shares: 198,
    platform: "youtube",
    style: "adventurous",
    aiProvider: "runway",
    tags: ["travel", "photography", "tips"],
    description: "Capture stunning travel photos with these expert tips",
  },
  {
    id: "6",
    title: "Tech Gadget Reviews",
    thumbnailUrl: "/api/placeholder/320/180",
    duration: 15,
    status: "failed",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    fileSize: 0,
    viralScore: 0,
    views: 0,
    likes: 0,
    shares: 0,
    platform: "instagram",
    style: "modern",
    aiProvider: "luma",
    tags: ["tech", "gadgets", "reviews"],
    description: "Latest tech gadgets reviewed and tested",
  },
];

export default function LibraryPage() {
  const router = useRouter();
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);

  const handleVideoSelect = useCallback((videoId: string) => {
    setSelectedVideos((prev) =>
      prev.includes(videoId)
        ? prev.filter((id) => id !== videoId)
        : [...prev, videoId]
    );
  }, []);

  const handleVideoAction = useCallback((action: string, videoId: string) => {
    console.log(`Action: ${action}, Video ID: ${videoId}`);
    // Handle individual video actions
    switch (action) {
      case "play":
        // Navigate to video player or open modal
        break;
      case "edit":
        // Navigate to video editor
        break;
      case "duplicate":
        // Duplicate video logic
        break;
      case "delete":
        // Delete video logic
        break;
      case "download":
        // Download video logic
        break;
      case "share":
        // Share video logic
        break;
      default:
        break;
    }
  }, []);

  const handleBulkAction = useCallback(
    (action: string) => {
      console.log(`Bulk action: ${action}, Selected videos:`, selectedVideos);
      // Handle bulk actions
      switch (action) {
        case "download":
          // Download selected videos
          break;
        case "share":
          // Share selected videos
          break;
        case "duplicate":
          // Duplicate selected videos
          break;
        case "delete":
          // Delete selected videos
          break;
        case "archive":
          // Archive selected videos
          break;
        case "addTags":
          // Add tags to selected videos
          break;
        default:
          break;
      }
    },
    [selectedVideos]
  );

  const handleSearch = useCallback((query: string) => {
    console.log("Search query:", query);
    // Implement search logic
  }, []);

  const handleFilterChange = useCallback((filters: VideoLibraryFilters) => {
    console.log("Filters changed:", filters);
    // Implement filter logic
  }, []);

  const handleSortChange = useCallback((sort: VideoLibrarySortOption) => {
    console.log("Sort changed:", sort);
    // Implement sort logic
  }, []);

  const handlePageChange = useCallback((page: number) => {
    console.log("Page changed:", page);
    // Implement pagination logic
  }, []);

  const handleCreateVideo = useCallback(() => {
    router.push("/dashboard/create");
  }, [router]);

  const handleSelectAll = useCallback(() => {
    if (selectedVideos.length === mockVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(mockVideos.map((video) => video.id));
    }
  }, [selectedVideos.length]);

  const handleClearSelection = useCallback(() => {
    setSelectedVideos([]);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Video Library</h1>
        <p className="text-muted-foreground text-lg">
          Manage and organize all your generated videos
        </p>
      </div>

      <VideoLibraryGrid
        videos={mockVideos}
        selectedVideoIds={selectedVideos}
        onVideoSelect={handleVideoSelect}
        onVideoAction={handleVideoAction}
        onBulkAction={(action) => handleBulkAction(action)}
        onSearch={handleSearch}
        onFilter={handleFilterChange}
        onSort={handleSortChange}
        onPageChange={handlePageChange}
        onCreateVideo={handleCreateVideo}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
      />
    </div>
  );
}
