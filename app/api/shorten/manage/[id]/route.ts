import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getLinkById, getLinkByIdAndUserId, deactivateLinkById } from "@/data/links-db";
import {
  apiSuccess,
  apiUnauthorized,
  apiNotFound,
  apiForbidden,
  apiInternalError,
} from "@/lib/api-response";
import { withCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return withCorsHeaders(request, apiUnauthorized("Authentication required"));
    }

    const { id } = await params;

    // Get the URL to verify ownership
    const url = await getLinkById(id);

    if (!url) {
      return withCorsHeaders(request, apiNotFound("Shortened URL not found"));
    }

    // Verify the URL belongs to the current user
    if (url.userId !== userId) {
      return withCorsHeaders(
        request,
        apiForbidden("This URL does not belong to you")
      );
    }

    // Soft delete by marking as inactive using helper
    await deactivateLinkById(id, userId);

    const response = apiSuccess({ message: "URL deleted successfully" });
    return withCorsHeaders(request, response);
  } catch (error) {
    console.error("Delete API error:", error);
    const response = apiInternalError("Internal server error");
    return withCorsHeaders(request, response);
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return withCorsHeaders(request, apiUnauthorized("Authentication required"));
    }

    const { id } = await params;

    // Get the specific URL using helper with ownership check
    const url = await getLinkByIdAndUserId(id, userId);

    if (!url) {
      return withCorsHeaders(request, apiNotFound("Shortened URL not found or access denied"));
    }

    const response = apiSuccess(url);
    return withCorsHeaders(request, response);
  } catch (error) {
    console.error("Get URL details API error:", error);
    const response = apiInternalError("Internal server error");
    return withCorsHeaders(request, response);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreFlight(request);
}