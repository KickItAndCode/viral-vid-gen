import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">ViralAI</h1>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium hover:text-primary transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                    Get Started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Create Viral Videos with AI
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate viral-ready videos in minutes using cutting-edge AI
            technology. Analyze trends, create scripts, and produce professional
            videos automatically.
          </p>
          <div className="flex items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <SignUpButton mode="modal">
                  <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors">
                    Start Creating
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="border border-border px-8 py-3 rounded-lg text-lg font-medium hover:bg-accent transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose ViralAI?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Generation</h3>
              <p className="text-muted-foreground">
                Create professional videos in under 2 minutes with AI-powered
                automation
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trend Analysis</h3>
              <p className="text-muted-foreground">
                AI analyzes viral trends to help you create content that
                resonates
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">High Success Rate</h3>
              <p className="text-muted-foreground">
                90% video generation success rate with multiple AI providers
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
