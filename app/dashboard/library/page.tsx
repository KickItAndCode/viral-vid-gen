import { Breadcrumb } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Library, Search, Filter, Play, MoreHorizontal, Download, Share } from "lucide-react";

export default function LibraryPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Video Library</h1>
        <p className="text-muted-foreground text-lg">
          Manage and organize all your generated videos
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your videos..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="default">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Video Card 1 */}
        <Card className="group hover:shadow-lg transition-all duration-200">
          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 flex items-center justify-center">
              <Button 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
            </div>
            <div className="absolute top-2 right-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </Button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              0:24
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">AI Productivity Hacks</CardTitle>
            <CardDescription className="text-sm">
              Generated 2 days ago • 8.7 viral score
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-xs text-green-600 font-medium">Completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Video Card 2 */}
        <Card className="group hover:shadow-lg transition-all duration-200">
          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
              <Button 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 hover:bg-black/70 text-white"
              >
                <Play className="h-4 w-4 mr-2" />
                Play
              </Button>
            </div>
            <div className="absolute top-2 right-2">
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-black/20 hover:bg-black/40">
                <MoreHorizontal className="h-4 w-4 text-white" />
              </Button>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              0:18
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sustainable Living Tips</CardTitle>
            <CardDescription className="text-sm">
              Generated 5 days ago • 7.9 viral score
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex space-x-1">
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <Share className="h-3 w-3" />
                </Button>
              </div>
              <span className="text-xs text-green-600 font-medium">Completed</span>
            </div>
          </CardContent>
        </Card>

        {/* Video Card 3 - Processing */}
        <Card className="group hover:shadow-lg transition-all duration-200 opacity-75">
          <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </div>
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Remote Work Setup</CardTitle>
            <CardDescription className="text-sm">
              Processing • Started 1 hour ago
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
              </div>
              <span className="text-xs text-orange-600 font-medium ml-2">60%</span>
            </div>
          </CardContent>
        </Card>

        {/* Empty State Card */}
        <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
          <div className="aspect-video flex flex-col items-center justify-center text-center p-6">
            <Library className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">Create New Video</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Generate your next viral video
            </p>
            <Button size="sm">
              Get Started
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}