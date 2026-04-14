import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getUserId } from "../lib/auth";
import { ok, unauthorized, badRequest, serverError } from "../lib/response";
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

    const rawId = event.pathParameters?.id;
    if (!rawId) return badRequest("Missing entry ID");

    const entryId = decodeURIComponent(rawId);

    log.info("deleting entry", { sk: entryId });

    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          PK: `USER#${userId}`,
          SK: entryId,
        },
      }),
    );

    log.info("entry deleted", { sk: entryId });

    return ok({ message: "Entry deleted successfully" });
  } catch (error) {
    logger
      .withContext({ requestId })
      .error("deleteEntry failed", { error: String(error) });
    return serverError(requestId);
  }
};
