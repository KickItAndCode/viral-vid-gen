import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ViralAI Dashboard</h1>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome to ViralAI</h2>
          <p className="text-muted-foreground">
            Start creating viral videos with AI-powered generation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Create Video</h3>
            <p className="text-muted-foreground mb-4">
              Generate viral videos from trending topics
            </p>
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
              Start Creating
            </button>
          </div>

          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Video Library</h3>
            <p className="text-muted-foreground mb-4">
              Manage your generated videos
            </p>
            <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
              View Library
            </button>
          </div>

          <div className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Track your video performance
            </p>
            <button className="w-full bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors">
              View Analytics
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
