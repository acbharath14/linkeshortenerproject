"use client";

import { useState } from "react";
import { Link as LinkType } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, ExternalLink, QrCode } from "lucide-react";

interface LinksTableProps {
  links: LinkType[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function LinksTable({ links, onDelete, onRefresh }: LinksTableProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<{ id: string; url: string } | null>(null);

  const copyToClipboard = (text: string, linkId: string) => {
    navigator.clipboard.writeText(text);
    setCopied(linkId);
    setTimeout(() => setCopied(null), 2000);
  };

  const generateQRCode = (shortCode: string) => {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      `${window.location.origin}/${shortCode}`
    )}`;
    setQrCode({ id: shortCode, url });
  };

  if (links.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground">No links created yet. Create your first short link!</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Short Link</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Original URL</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Clicks</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Created</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id} className="border-b hover:bg-muted/50">
                  <td className="px-4 py-3 text-sm font-mono">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/${link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        /{link.shortCode}
                      </a>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${window.location.origin}/${link.shortCode}`,
                            link.id
                          )
                        }
                        className="rounded p-1 hover:bg-muted"
                        title="Copy to clipboard"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={link.originalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline truncate max-w-xs inline-block"
                      title={link.originalUrl}
                    >
                      {link.originalUrl}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {link.title || <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">
                    {link.clicks}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => generateQRCode(link.shortCode)}
                        className="rounded p-1 hover:bg-muted"
                        title="Generate QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(link.id)}
                        className="rounded p-1 hover:bg-red-500/10 text-red-500"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setQrCode(null)}
        >
          <div
            className="rounded-lg bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold">QR Code</h3>
            <img src={qrCode.url} alt="QR Code" className="mb-4" />
            <p className="mb-4 text-sm text-muted-foreground">
              Scan this code to access: /{qrCode.id}
            </p>
            <Button onClick={() => setQrCode(null)} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
