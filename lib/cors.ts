import { NextRequest, NextResponse } from "next/server";

/**
 * CORS configuration
 * Configure allowed origins, methods, and headers
 */

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean);

const ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];

const ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-Requested-With",
  "Accept",
  "Origin",
];

/**
 * Add CORS headers to response
 * @param request - The request object
 * @param response - The response object (or null for OPTIONS requests)
 * @returns Response with CORS headers
 */
export function withCorsHeaders(
  request: NextRequest,
  response?: NextResponse
): NextResponse {
  const origin = request.headers.get("origin");
  const isAllowedOrigin = !origin || ALLOWED_ORIGINS.includes(origin);

  // Clone response or create new one to allow header modifications
  const responseToModify = response 
    ? new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
      })
    : new NextResponse(null, { status: 204 });

  // Set CORS headers
  if (isAllowedOrigin && origin) {
    responseToModify.headers.set("Access-Control-Allow-Origin", origin);
  }

  responseToModify.headers.set("Access-Control-Allow-Methods", ALLOWED_METHODS.join(", "));
  responseToModify.headers.set("Access-Control-Allow-Headers", ALLOWED_HEADERS.join(", "));
  responseToModify.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

  return responseToModify;
}

/**
 * Handle CORS preflight requests
 * Add this to your API routes:
 * 
 * export async function OPTIONS(request: NextRequest) {
 *   return handleCorsPreFlight(request);
 * }
 */
export function handleCorsPreFlight(request: NextRequest): NextResponse {
  return withCorsHeaders(request, new NextResponse(null, { status: 204 }));
}

/**
 * Middleware wrapper to add CORS headers to all responses
 * Usage example in route handler:
 * 
 * export async function GET(request: NextRequest) {
 *   try {
 *     const response = apiSuccess(data);
 *     return withCorsHeaders(request, response);
 *   } catch (error) {
 *     const response = apiInternalError();
 *     return withCorsHeaders(request, response);
 *   }
 * }
 */
