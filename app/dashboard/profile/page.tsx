import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Account Settings
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings, security preferences, and connected
            accounts.
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <UserProfile
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 bg-transparent",
                navbar: "bg-muted/50 border-b border-border",
                navbarButton: {
                  color: "hsl(var(--muted-foreground))",
                  "&[data-active='true']": {
                    color: "hsl(var(--primary))",
                    backgroundColor: "hsl(var(--primary) / 0.1)",
                  },
                },
                pageScrollBox: "bg-background",
                profileSectionTitle: "text-foreground",
                profileSectionContent: "text-muted-foreground",
                formButtonPrimary: {
                  backgroundColor: "hsl(var(--primary))",
                  "&:hover": {
                    backgroundColor: "hsl(var(--primary) / 0.9)",
                  },
                },
              },
              variables: {
                colorPrimary: "hsl(var(--primary))",
                colorBackground: "hsl(var(--background))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                colorInputBackground: "hsl(var(--input))",
                borderRadius: "0.75rem",
              },
            }}
            routing="hash"
          />
        </div>
      </div>
    </div>
  );
}
