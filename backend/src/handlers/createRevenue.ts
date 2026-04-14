import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { createTransactionSchema } from "../lib/validation";
import { getUserId } from "../lib/auth";
import {
  badRequest,
  created,
  unauthorized,
  serverError,
} from "../lib/response";
import { logger } from "../lib/logger";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const TABLE_NAME = process.env.TABLE_NAME!;

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;

  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized();

    const log = logger.withContext({ requestId, userId });

    let rawBody: unknown;
    try {
      rawBody = JSON.parse(event.body ?? "{}");
    } catch {
      return badRequest("Invalid JSON body");
    }

    const parseResult = createTransactionSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const message = parseResult.error.issues
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return badRequest(message, "VALIDATION_ERROR");
    }

    const input = parseResult.data;
    const id = randomUUID();
    const sk = `TXN#${input.date}#${id}`;

    const item = {
      PK: `USER#${userId}`,
      SK: sk,
      type: "Transaction",
      transactionType: input.transactionType,
      date: input.date,
      amount: input.amount,
      source: input.source,
      category: input.category,
      description: input.description,
      createdAt: new Date().toISOString(),
    };

    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));

    log.info("transaction created", {
      sk,
      amount: input.amount,
      transactionType: input.transactionType,
    });

    const { PK: _pk, SK: _sk, ...dto } = item;
    return created({ id: sk, ...dto });
  } catch (error) {
    logger
      .withContext({ requestId })
      .error("createTransaction failed", { error: String(error) });
    return serverError(requestId);
  }
};
