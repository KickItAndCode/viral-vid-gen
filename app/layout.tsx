import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ViralAI - AI-Powered Video Generation",
  description: "Create viral videos with AI in minutes",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          // ViralAI brand colors
          colorPrimary: "hsl(262 100% 70%)", // Brighter purple for dark mode
          colorBackground: "hsl(222.2 84% 4.9%)",
          colorInputBackground: "hsl(217.2 32.6% 17.5%)",
          colorInputText: "hsl(210 40% 98%)",
          colorText: "hsl(210 40% 98%)",
          colorTextSecondary: "hsl(215 20.2% 65.1%)",
          colorSuccess: "hsl(142 76% 36%)",
          colorDanger: "hsl(0 84.2% 60.2%)",
          colorWarning: "hsl(48 96% 53%)",
          colorNeutral: "hsl(217.2 32.6% 17.5%)",
          borderRadius: "0.75rem", // Match our design system
          fontFamily: "Inter, sans-serif",
          fontSize: "0.875rem",
        },
        elements: {
          // Enhanced form styling
          formButtonPrimary: {
            backgroundColor: "hsl(262 100% 70%)",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            height: "2.5rem",
            "&:hover": {
              backgroundColor: "hsl(262 100% 65%)",
            },
            "&:focus": {
              boxShadow: "0 0 0 2px hsl(262 100% 70% / 0.2)",
            },
          },
          formFieldInput: {
            backgroundColor: "hsl(217.2 32.6% 17.5%)",
            borderColor: "hsl(217.2 32.6% 25%)",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            height: "2.5rem",
            "&:focus": {
              borderColor: "hsl(262 100% 70%)",
              boxShadow: "0 0 0 2px hsl(262 100% 70% / 0.2)",
            },
          },
          card: {
            backgroundColor: "hsl(222.2 84% 4.9%)",
            borderRadius: "1rem",
            border: "1px solid hsl(217.2 32.6% 17.5%)",
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)",
          },
          headerTitle: {
            color: "hsl(210 40% 98%)",
            fontSize: "1.5rem",
            fontWeight: "600",
          },
          headerSubtitle: {
            color: "hsl(215 20.2% 65.1%)",
            fontSize: "0.875rem",
          },
          socialButtonsBlockButton: {
            backgroundColor: "hsl(217.2 32.6% 17.5%)",
            borderColor: "hsl(217.2 32.6% 25%)",
            borderRadius: "0.75rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            height: "2.5rem",
            "&:hover": {
              backgroundColor: "hsl(217.2 32.6% 20%)",
            },
          },
          footerActionLink: {
            color: "hsl(262 100% 70%)",
            fontSize: "0.875rem",
            "&:hover": {
              color: "hsl(262 100% 80%)",
            },
          },
          dividerLine: {
            backgroundColor: "hsl(217.2 32.6% 25%)",
          },
          dividerText: {
            color: "hsl(215 20.2% 65.1%)",
            fontSize: "0.875rem",
          },
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
