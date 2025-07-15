import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-blue-600 p-8 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center space-x-2 text-white">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">V</span>
            </div>
            <span className="text-xl font-bold">ViralAI</span>
          </Link>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Start creating with
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              ViralAI
            </span>
          </h1>
          <p className="text-white/80 text-lg">
            Join thousands of content creators using AI to generate viral
            videos. Transform trends into engaging content in minutes, not
            hours.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🚀</span>
              </div>
              <span>Create your first video in under 5 minutes</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">📈</span>
              </div>
              <span>Access real-time trending content</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🎯</span>
              </div>
              <span>No credit card required to start</span>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 border border-white/20">
            <p className="text-white/90 text-sm font-medium mb-2">
              "ViralAI has revolutionized how I create content. What used to
              take hours now takes minutes!"
            </p>
            <p className="text-white/60 text-xs">— Sarah K., Content Creator</p>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2025 ViralAI. All rights reserved.
        </div>
      </div>

      {/* Right side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <Link href="/" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-primary">V</span>
              </div>
              <span className="text-xl font-bold text-foreground">ViralAI</span>
            </Link>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Create your account
            </h2>
            <p className="text-muted-foreground">
              Get started with ViralAI and create your first viral video today
            </p>
          </div>

          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0",
              },
            }}
            routing="hash"
            redirectUrl="/dashboard"
          />

          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>
              Already have an account?{" "}
              <Link
                href={"/sign-in" as any}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-xs">
              By signing up, you agree to our{" "}
              <Link
                href={"/terms" as any}
                className="text-primary hover:text-primary/80"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href={"/privacy" as any}
                className="text-primary hover:text-primary/80"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
