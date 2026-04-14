import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from "../lib/auth";
import { ok, unauthorized, badRequest, serverError } from "../lib/response";
import { logger } from "../lib/logger";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const origin = event.headers?.origin ?? event.headers?.Origin;

  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized(origin);

    const log = logger.withContext({ requestId, userId });

    const category = event.pathParameters?.category;
    if (!category)
      return badRequest("category is required", "BAD_REQUEST", origin);

    const decodedCategory = decodeURIComponent(category);
    const qs = event.queryStringParameters ?? {};
    const from = qs.from;
    const to = qs.to;

    let keyCondition = "GSI1PK = :pk";
    const exprValues: Record<string, string> = {
      ":pk": `USER#${userId}#CATEGORY#${decodedCategory}`,
    };

    if (from && to) {
      keyCondition += " AND GSI1SK BETWEEN :from AND :to";
      exprValues[":from"] = from;
      exprValues[":to"] = to + "\uffff";
    } else if (from) {
      keyCondition += " AND GSI1SK >= :from";
      exprValues[":from"] = from;
    } else if (to) {
      keyCondition += " AND GSI1SK <= :to";
      exprValues[":to"] = to + "\uffff";
    }

    log.info("querying by category", { category: decodedCategory, from, to });

    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: "CategoryDateIndex",
        KeyConditionExpression: keyCondition,
        ExpressionAttributeValues: exprValues,
        ScanIndexForward: false,
        Limit: 100,
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

    log.info("category query complete", { count: items.length });

    return ok({ items }, origin);
  } catch (error) {
    logger
      .withContext({ requestId })
      .error("getByCategory failed", { error: String(error) });
    return serverError(requestId, origin);
  }
};
