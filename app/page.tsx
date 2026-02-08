"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Link2, Zap, BarChart3, Shield, Globe, Smartphone } from "lucide-react";

export default function Home() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Show nothing while checking authentication
  if (!isLoaded) {
    return null;
  }

  // If signed in, redirect will happen (show nothing)
  if (isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-6 py-20 md:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Shorten Links.{" "}
              <span className="text-primary">Track Performance.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Create short, memorable links in seconds. Monitor clicks, analyze traffic, 
              and grow your online presence with our powerful link shortening platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Why Choose Our Link Shortener?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to manage and optimize your links
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Link2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Instant Short Links</h3>
              <p className="text-muted-foreground">
                Generate short, clean URLs instantly. Perfect for social media, 
                emails, and anywhere you need a compact link.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Experience blazing-fast redirects with our optimized infrastructure. 
                Your users won't even notice the redirect.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analytics & Insights</h3>
              <p className="text-muted-foreground">
                Track clicks, analyze traffic sources, and understand your audience 
                with detailed analytics and reports.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Your links are protected with industry-standard security. We ensure 
                99.9% uptime so your links always work.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Custom Domains</h3>
              <p className="text-muted-foreground">
                Use your own branded domain for shortened links. Build trust and 
                strengthen your brand identity.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Mobile Optimized</h3>
              <p className="text-muted-foreground">
                Manage your links on the go. Our responsive design works perfectly 
                on all devices, from desktop to mobile.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-12">
        <div className="mx-auto max-w-6xl text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Link Shortener. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
