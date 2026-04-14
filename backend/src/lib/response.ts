import { APIGatewayProxyResult } from "aws-lambda";

const ALLOWED_ORIGINS = [
  process.env.ALLOWED_ORIGIN ?? "*",
  "http://localhost:5173",
  "http://localhost:4173",
];

function getCorsOrigin(requestOrigin?: string): string {
  if (!requestOrigin) return ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes(requestOrigin)) return requestOrigin;
  return ALLOWED_ORIGINS[0];
}

export function corsHeaders(requestOrigin?: string) {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": getCorsOrigin(requestOrigin),
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
}

export const ok = (body: unknown, origin?: string): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: corsHeaders(origin),
  body: JSON.stringify(body),
});

export const created = (
  body: unknown,
  origin?: string,
): APIGatewayProxyResult => ({
  statusCode: 201,
  headers: corsHeaders(origin),
  body: JSON.stringify(body),
});

export const badRequest = (
  message: string,
  code = "BAD_REQUEST",
  origin?: string,
): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: corsHeaders(origin),
  body: JSON.stringify({ error: message, code }),
});

export const unauthorized = (origin?: string): APIGatewayProxyResult => ({
  statusCode: 401,
  headers: corsHeaders(origin),
  body: JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
});

export const serverError = (
  requestId?: string,
  origin?: string,
): APIGatewayProxyResult => ({
  statusCode: 500,
  headers: corsHeaders(origin),
  body: JSON.stringify({
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
    requestId,
  }),
});
