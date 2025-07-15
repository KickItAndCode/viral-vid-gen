import { Breadcrumb } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Shield, Palette, Zap, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <Breadcrumb />

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-lg">
          Manage your account preferences and app configuration
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <nav className="space-y-1">
              <a
                href="#general"
                className="flex items-center px-4 py-2 text-sm font-medium bg-primary/10 text-primary rounded-lg"
              >
                <Settings className="h-4 w-4 mr-3" />
                General
              </a>
              <a
                href="#notifications"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              >
                <Bell className="h-4 w-4 mr-3" />
                Notifications
              </a>
              <a
                href="#security"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              >
                <Shield className="h-4 w-4 mr-3" />
                Security
              </a>
              <a
                href="#appearance"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              >
                <Palette className="h-4 w-4 mr-3" />
                Appearance
              </a>
              <a
                href="#advanced"
                className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg"
              >
                <Zap className="h-4 w-4 mr-3" />
                Advanced
              </a>
            </nav>
          </CardContent>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* General Settings */}
          <Card id="general">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
              <CardDescription>
                Manage your basic account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input id="displayName" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Tell us about yourself..." />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Default Video Style</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred video generation style
                  </p>
                </div>
                <select className="bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>Professional</option>
                  <option>Casual</option>
                  <option>Creative</option>
                  <option>Educational</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card id="notifications">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Video Generation Complete</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when your videos are ready
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trending Topics</Label>
                  <p className="text-sm text-muted-foreground">
                    Weekly digest of new trending content
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Performance Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Analytics and performance insights
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marketing Communications</Label>
                  <p className="text-sm text-muted-foreground">
                    Product updates and feature announcements
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card id="security">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Manage your account security and privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Active Sessions</Label>
                  <p className="text-sm text-muted-foreground">
                    Manage devices that are signed into your account
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Export</Label>
                  <p className="text-sm text-muted-foreground">
                    Download a copy of your account data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Request
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card id="appearance">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Theme Preference</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred color theme
                  </p>
                </div>
                <select className="bg-background border border-border rounded-md px-3 py-2 text-sm">
                  <option>System</option>
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use a more compact interface layout
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable smooth transitions and animations
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end">
            <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
