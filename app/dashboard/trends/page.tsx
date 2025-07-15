import { Breadcrumb } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TrendingUp, Search, Filter, Clock, Users, Heart } from "lucide-react";

export default function TrendsPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Trending Content</h1>
        <p className="text-muted-foreground text-lg">
          Discover viral topics and trending content across platforms
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trending topics..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="default">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Trending Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Trend Card 1 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-500">Viral Score: 9.2</span>
              </div>
              <span className="text-xs text-muted-foreground">2h ago</span>
            </div>
            <CardTitle className="text-lg">AI Productivity Hacks</CardTitle>
            <CardDescription>
              Latest AI tools revolutionizing workplace productivity
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>1.2M</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>89K</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Trending</span>
              </div>
            </div>
            <Button size="sm" className="w-full">
              Create Video
            </Button>
          </CardContent>
        </Card>

        {/* Trend Card 2 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium text-orange-500">Viral Score: 8.7</span>
              </div>
              <span className="text-xs text-muted-foreground">4h ago</span>
            </div>
            <CardTitle className="text-lg">Sustainable Living</CardTitle>
            <CardDescription>
              Eco-friendly lifestyle tips gaining massive traction
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>890K</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>67K</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Hot</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Create Video
            </Button>
          </CardContent>
        </Card>

        {/* Trend Card 3 */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-500">Viral Score: 8.1</span>
              </div>
              <span className="text-xs text-muted-foreground">6h ago</span>
            </div>
            <CardTitle className="text-lg">Remote Work Setup</CardTitle>
            <CardDescription>
              Perfect home office configurations and gear recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>645K</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>45K</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Rising</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Create Video
            </Button>
          </CardContent>
        </Card>

        {/* More trend cards... */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">Viral Score: 7.9</span>
              </div>
              <span className="text-xs text-muted-foreground">8h ago</span>
            </div>
            <CardTitle className="text-lg">Fitness Motivation</CardTitle>
            <CardDescription>
              Inspiring workout routines and transformation stories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>523K</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-3 w-3" />
                  <span>38K</span>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Stable</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="w-full">
              Create Video
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}