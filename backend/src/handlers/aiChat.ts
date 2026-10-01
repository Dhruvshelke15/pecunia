import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import Anthropic from "@anthropic-ai/sdk";
import { getUserId } from "../lib/auth";
import { ok, unauthorized, badRequest, serverError } from "../lib/response";
import { logger } from "../lib/logger";
import { z } from "zod";

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsClient = new SecretsManagerClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const SECRET_ARN = process.env.ANTHROPIC_SECRET_ARN!;

let cachedApiKey: string | null = null;

async function getApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: SECRET_ARN }),
  );
  const secret = JSON.parse(response.SecretString ?? "{}");
  cachedApiKey = secret.ANTHROPIC_API_KEY;
  return cachedApiKey!;
}

const schema = z.object({
  message: z.string().min(1).max(500),
});

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const requestId = event.requestContext.requestId;
  const origin = event.headers?.origin ?? event.headers?.Origin;

  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized(origin);

    const log = logger.withContext({ requestId, userId });

    const parsed = schema.safeParse(JSON.parse(event.body ?? "{}"));
    if (!parsed.success)
      return badRequest("message is required", "BAD_REQUEST", origin);

    const { message } = parsed.data;

    const response = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": `USER#${userId}` },
        ScanIndexForward: false,
        Limit: 200,
      }),
    );

    const transactions = (response.Items ?? []).map((item) => ({
      date: item.date,
      amount: item.amount,
      source: item.source,
      category: item.category,
      type: item.transactionType,
      description: item.description,
    }));

    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown = transactions.reduce(
      (acc: Record<string, number>, t) => {
        acc[t.category] = (acc[t.category] ?? 0) + t.amount;
        return acc;
      },
      {},
    );

    const systemPrompt = `You are a personal finance assistant for Pecunia, a finance tracking app.
You have access to the user's recent transaction data. Be concise, helpful, and specific with numbers.
Always format currency as $X.XX. If asked about trends, reference specific dates or categories.
Do not make up data that is not in the provided transactions.

Financial summary:
- Total income: $${totalIncome.toFixed(2)}
- Total expenses: $${totalExpense.toFixed(2)}
- Net balance: $${(totalIncome - totalExpense).toFixed(2)}

Category breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, amt]) => `- ${cat}: $${(amt as number).toFixed(2)}`)
  .join("\n")}

Recent transactions (newest first):
${transactions
  .slice(0, 50)
  .map(
    (t) =>
      `${t.date} | ${t.type} | ${t.source} | ${t.category} | $${t.amount.toFixed(2)}`,
  )
  .join("\n")}`;

    log.info("ai chat request", {
      messageLength: message.length,
      transactionCount: transactions.length,
    });

    const apiKey = await getApiKey();
    const anthropic = new Anthropic({ apiKey });

    const aiResponse = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    const reply = aiResponse.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    log.info("ai chat response", { replyLength: reply.length });

    return ok({ reply }, origin);
  } catch (error) {
    logger
      .withContext({ requestId })
      .error("aiChat failed", { error: String(error) });
    return serverError(requestId, origin);
  }
};
