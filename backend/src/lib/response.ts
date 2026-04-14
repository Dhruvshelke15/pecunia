import { APIGatewayProxyResult } from "aws-lambda";

const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
};

export const ok = (body: unknown): APIGatewayProxyResult => ({
  statusCode: 200,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const created = (body: unknown): APIGatewayProxyResult => ({
  statusCode: 201,
  headers: CORS_HEADERS,
  body: JSON.stringify(body),
});

export const badRequest = (
  message: string,
  code = "BAD_REQUEST",
): APIGatewayProxyResult => ({
  statusCode: 400,
  headers: CORS_HEADERS,
  body: JSON.stringify({ error: message, code }),
});

export const unauthorized = (): APIGatewayProxyResult => ({
  statusCode: 401,
  headers: CORS_HEADERS,
  body: JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }),
});

export const serverError = (requestId?: string): APIGatewayProxyResult => ({
  statusCode: 500,
  headers: CORS_HEADERS,
  body: JSON.stringify({
    error: "Internal Server Error",
    code: "INTERNAL_ERROR",
    requestId,
  }),
});
