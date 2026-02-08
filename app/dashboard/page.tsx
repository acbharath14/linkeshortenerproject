"use client";

import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { CreateLinkForm } from "@/components/create-link-form";
import { LinksTable } from "@/components/links-table";
import { Link as LinkType } from "@/db/schema";
import { BarChart3, Link2 } from "lucide-react";

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [links, setLinks] = useState<LinkType[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0 });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      fetchLinks();
    }
  }, [isSignedIn]);

  const fetchLinks = async () => {
    try {
      setIsLoadingLinks(true);
      const response = await fetch("/api/links");
      if (response.ok) {
        const data = await response.json();
        setLinks(data);
        setStats({
          totalLinks: data.length,
          totalClicks: data.reduce((sum: number, link: LinkType) => sum + (link.clicks || 0), 0),
        });
      }
    } catch (error) {
      console.error("Failed to fetch links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/links/${id}`, { method: "DELETE" });
      if (response.ok) {
        setLinks(links.filter((link) => link.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  // Show nothing while checking authentication
  if (!isLoaded) {
    return null;
  }

  // If not signed in, redirect will happen
  if (!isSignedIn) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Manage your shortened links and track performance</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Links</p>
                <p className="text-3xl font-bold">{stats.totalLinks}</p>
              </div>
              <Link2 className="h-10 w-10 text-primary/50" />
            </div>
          </div>
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-3xl font-bold">{stats.totalClicks}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-primary/50" />
            </div>
          </div>
        </div>

        {/* Create Link Form */}
        <div className="mb-8">
          <CreateLinkForm onSuccess={fetchLinks} />
        </div>

        {/* Links Table */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Your Links</h2>
          {isLoadingLinks ? (
            <div className="rounded-lg border p-8 text-center">
              <p className="text-muted-foreground">Loading your links...</p>
            </div>
          ) : (
            <LinksTable links={links} onDelete={handleDeleteLink} onRefresh={fetchLinks} />
          )}
        </div>
      </div>
    </main>
  );
}
