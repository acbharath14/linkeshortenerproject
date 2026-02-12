import { NextResponse } from "next/server";

/**
 * Standardized API response format
 * All API endpoints should use these utilities for consistent error/success handling
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Success response
 */
export function apiSuccess<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

/**
 * Error response with standardized format
 */
export function apiError(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * 400 Bad Request
 */
export function apiBadRequest(message: string = "Bad request", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 400, code);
}

/**
 * 401 Unauthorized
 */
export function apiUnauthorized(message: string = "Unauthorized", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 401, code);
}

/**
 * 403 Forbidden
 */
export function apiForbidden(message: string = "Forbidden", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 403, code);
}

/**
 * 404 Not Found
 */
export function apiNotFound(message: string = "Not found", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 404, code);
}

/**
 * 409 Conflict
 */
export function apiConflict(message: string = "Conflict", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 409, code);
}

/**
 * 429 Too Many Requests
 */
export function apiTooManyRequests(message: string = "Too many requests", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 429, code);
}

/**
 * 500 Internal Server Error
 */
export function apiInternalError(message: string = "Internal server error", code?: string): NextResponse<ApiResponse> {
  return apiError(message, 500, code);
}
