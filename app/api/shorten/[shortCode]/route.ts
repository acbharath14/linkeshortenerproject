import { NextRequest, NextResponse } from "next/server";
import { getLinkByCode, incrementClicks } from "@/data/links-db";
import { apiSuccess, apiNotFound, apiInternalError } from "@/lib/api-response";
import { withCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    // Find the shortened URL using helper
    const url = await getLinkByCode(shortCode);

    if (!url) {
      return withCorsHeaders(request, apiNotFound("Shortened URL not found"));
    }

    // Check if URL is active
    if (!url.isActive) {
      return withCorsHeaders(request, apiNotFound("This link has been disabled"));
    }

    // Check if URL has expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return withCorsHeaders(request, apiNotFound("This link has expired"));
    }

    // Increment click count using helper
    await incrementClicks(shortCode);

    // Return the original URL (client will handle redirect or return as data)
    const response = apiSuccess({
      originalUrl: url.originalUrl,
      shortCode: url.shortCode,
    });
    return withCorsHeaders(request, response);
  } catch (error) {
    console.error("Redirect API error:", error);
    const response = apiInternalError("Internal server error");
    return withCorsHeaders(request, response);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request);
}