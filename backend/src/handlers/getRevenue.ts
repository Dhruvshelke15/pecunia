import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from "../lib/auth";
import { ok, unauthorized, badRequest, serverError } from "../lib/response";
import { logger } from "../lib/logger";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;
const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const origin = event.headers?.origin ?? event.headers?.Origin;

  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized(origin);

    const log = logger.withContext({ requestId, userId });

    const qs = event.queryStringParameters ?? {};

    const limitRaw = parseInt(qs.limit ?? String(DEFAULT_PAGE_SIZE), 10);
    if (isNaN(limitRaw) || limitRaw < 1)
      return badRequest(
        "limit must be a positive integer",
        "BAD_REQUEST",
        origin,
      );
    const limit = Math.min(limitRaw, MAX_PAGE_SIZE);

    let exclusiveStartKey: Record<string, unknown> | undefined;
    if (qs.cursor) {
      try {
        exclusiveStartKey = JSON.parse(
          Buffer.from(qs.cursor, "base64url").toString("utf-8"),
        );
      } catch {
        return badRequest("Invalid cursor", "BAD_REQUEST", origin);
      }
    }

    log.info("fetching transactions", {
      limit,
      hasCursor: !!exclusiveStartKey,
    });

    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `USER#${userId}` },
        ScanIndexForward: false,
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
      }),
    );

    const items = (response.Items ?? []).map((item) => ({
      id: item.SK as string,
      transactionType: item.transactionType,
      date: item.date,
      amount: item.amount,
      source: item.source,
      category: item.category,
      description: item.description,
      createdAt: item.createdAt,
    }));

    const nextCursor = response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64url",
        )
      : undefined;

    log.info("transactions fetched", {
      count: items.length,
      hasNextPage: !!nextCursor,
    });

    return ok({ items, nextCursor }, origin);
  } catch (error) {
    logger
      .withContext({ requestId })
      .error("getRevenue failed", { error: String(error) });
    return serverError(requestId, origin);
  }
};
