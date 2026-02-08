"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2 } from "lucide-react";

interface CreateLinkFormProps {
  onSuccess: () => void;
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    originalUrl: "",
    title: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to create link");
      }

      setFormData({ originalUrl: "", title: "", description: "" });
      setIsOpen(false);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} size="lg">
        <Link2 className="mr-2 h-5 w-5" />
        Create Short Link
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold">Create New Short Link</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="url" className="block text-sm font-medium mb-2">
            Original URL *
          </label>
          <input
            id="url"
            type="url"
            required
            placeholder="https://example.com/long/url"
            value={formData.originalUrl}
            onChange={(e) =>
              setFormData({ ...formData, originalUrl: e.target.value })
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title (Optional)
          </label>
          <input
            id="title"
            type="text"
            placeholder="My Link"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            placeholder="Add a description..."
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Link"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setFormData({ originalUrl: "", title: "", description: "" });
              setError(null);
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
