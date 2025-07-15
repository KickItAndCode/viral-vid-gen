import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function ForgotPasswordPage() {
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
            Reset your password
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              securely
            </span>
          </h1>
          <p className="text-white/80 text-lg">
            Don't worry, we'll help you get back to creating viral content in no
            time. Enter your email and we'll send you a reset link.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">🔒</span>
              </div>
              <span>Secure password reset process</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">⚡</span>
              </div>
              <span>Get back to creating in minutes</span>
            </div>
            <div className="flex items-center space-x-3 text-white/80">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm">📧</span>
              </div>
              <span>Reset link sent instantly</span>
            </div>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          © 2025 ViralAI. All rights reserved.
        </div>
      </div>

      {/* Right side - Password Reset Form */}
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
              Reset your password
            </h2>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your
              password
            </p>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent p-0",
              },
            }}
            routing="hash"
            initialValues={{
              emailAddress: "",
            }}
            redirectUrl="/dashboard"
          />

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Remember your password?{" "}
              <Link
                href={"/sign-in" as any}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
