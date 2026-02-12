import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserLinks, createLink, checkCustomAliasExists, checkShortCodeExists } from "@/data/links-db";
import { z } from 'zod';
import { rateLimiter } from "@/lib/rate-limit";
import { 
  apiSuccess, 
  apiBadRequest, 
  apiUnauthorized, 
  apiConflict, 
  apiTooManyRequests,
  apiInternalError 
} from "@/lib/api-response";
import { withCorsHeaders, handleCorsPreFlight } from "@/lib/cors";

const CreateLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL format"),
  customAlias: z.string()
    .regex(/^[a-zA-Z0-9_-]+$/, "Custom alias can only contain letters, numbers, hyphens, and underscores")
    .min(3, "Custom alias must be at least 3 characters")
    .max(30, "Custom alias must be at most 30 characters")
    .optional(),
  description: z.string().max(500, "Description must be at most 500 characters").optional(),
  expiresAt: z.string().datetime().optional(),
});

// Generate a random short code
function generateShortCode(length: number = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate URL format and protocol
// Note: In production, consider enforcing HTTPS-only URLs for enhanced security
// by modifying this function to return false for http:// URLs
function isValidUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = request.headers.get("x-forwarded-for") ?? 
                request.headers.get("x-real-ip") ?? 
                "127.0.0.1";
    const { success } = await rateLimiter.limit(ip);
    
    if (!success) {
      return withCorsHeaders(request, apiTooManyRequests("Too many requests. Please try again later."));
    }

    const { userId } = await auth();

    if (!userId) {
      return withCorsHeaders(request, apiUnauthorized("Authentication required"));
    }

    const body = await request.json();
    
    const validation = CreateLinkSchema.safeParse(body);
    if (!validation.success) {
      return withCorsHeaders(
        request, 
        apiBadRequest(validation.error.issues[0].message)
      );
    }
    const { originalUrl, customAlias, description, expiresAt } = validation.data;

    // Normalize custom alias to lowercase for consistency
    const normalizedAlias = customAlias?.toLowerCase();

    // Check if custom alias already exists
    if (normalizedAlias) {
      const aliasExists = await checkCustomAliasExists(normalizedAlias);

      if (aliasExists) {
        return withCorsHeaders(
          request,
          apiConflict("Custom alias already in use")
        );
      }
    }

    // Generate short code
    let shortCode = (normalizedAlias || generateShortCode()).toLowerCase();

    // Ensure short code is unique if randomly generated
    if (!normalizedAlias) {
      let codeExists = true;
      while (codeExists) {
        codeExists = await checkShortCodeExists(shortCode);

        if (codeExists) {
          shortCode = generateShortCode().toLowerCase();
        }
      }
    }

    const newUrl = await createLink(
      userId,
      originalUrl,
      shortCode,
      normalizedAlias,
      description
    );

    const response = apiSuccess(
      {
        ...newUrl,
        shortUrl: `${process.env.NEXT_PUBLIC_APP_URL}/l/${shortCode}`,
      },
      201
    );

    return withCorsHeaders(request, response);
  } catch (error) {
    // Log detailed error server-side only
    console.error("API error:", error);
    const response = apiInternalError("An error occurred while processing your request");
    return withCorsHeaders(request, response);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return withCorsHeaders(request, apiUnauthorized("Authentication required"));
    }

    // Get all URLs for the current user using helper
    const urls = await getUserLinks(userId);

    const response = apiSuccess({ data: urls });
    return withCorsHeaders(request, response);
  } catch (error) {
    // Log detailed error server-side only
    console.error("API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request" },
      { status: 500 }
    );
  }
}
