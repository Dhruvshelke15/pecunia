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

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const secretsClient = new SecretsManagerClient({});
const TABLE_NAME = process.env.TABLE_NAME!;
const ANTHROPIC_SECRET_ARN = process.env.ANTHROPIC_SECRET_ARN!;

type InsightType = "health_score" | "forecast" | "personality";

async function getAnthropicClient() {
  const secret = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: ANTHROPIC_SECRET_ARN }),
  );
  const { ANTHROPIC_API_KEY } = JSON.parse(secret.SecretString!);
  return new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

async function getUserTransactions(userId: string) {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: { ":pk": `USER#${userId}` },
      ScanIndexForward: false,
      Limit: 100,
    }),
  );
  return res.Items ?? [];
}

const PROMPTS: Record<InsightType, (txns: unknown[]) => string> = {
  health_score: (txns) => `
You are a financial analyst. Given these transactions, return ONLY a JSON object (no markdown, no explanation):
{
  "score": <0-100 integer>,
  "grade": <"A"|"B"|"C"|"D"|"F">,
  "breakdown": { "savingsRate": <0-100>, "expenseConsistency": <0-100>, "diversification": <0-100> },
  "summary": "<2 sentence summary>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
Scoring: savingsRate = (income-expenses)/income*100 capped at 100. expenseConsistency = how stable monthly spend is. diversification = spread across categories.
Transactions: ${JSON.stringify(txns)}`,

  forecast: (txns) => `
You are a financial forecasting engine. Given these transactions, return ONLY a JSON object (no markdown):
{
  "projectedIncome": <number>,
  "projectedExpenses": <number>,
  "projectedNet": <number>,
  "confidence": <"high"|"medium"|"low">,
  "reasoning": "<1-2 sentences>",
  "categoryForecasts": [{ "category": "<name>", "projected": <number> }]
}
Base projections on the last 30-60 days of patterns. If insufficient data, use what exists and set confidence to "low".
Transactions: ${JSON.stringify(txns)}`,

  personality: (txns) => `
You are a behavioral finance expert. Given these transactions, return ONLY a JSON object (no markdown):
{
  "archetype": "<one of: The Saver | The Comfort Spender | The Balanced Planner | The Impulsive Buyer | The Minimalist>",
  "emoji": "<single emoji>",
  "tagline": "<10 word max tagline>",
  "dominantCategory": "<top expense category>",
  "description": "<2 sentences about spending behavior>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "watchouts": ["<watchout 1>", "<watchout 2>"],
  "recommendation": "<one actionable sentence>"
}
Transactions: ${JSON.stringify(txns)}`,
};

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const origin = event.headers?.Origin ?? event.headers?.origin;
  const requestId = event.requestContext.requestId;

  try {
    const userId = getUserId(event);
    if (!userId) return unauthorized(origin);

    const body = JSON.parse(event.body ?? "{}");
    const type: InsightType = body.type;
    if (!["health_score", "forecast", "personality"].includes(type)) {
      return badRequest(
        "type must be health_score, forecast, or personality",
        "VALIDATION_ERROR",
        origin,
      );
    }

    const transactions = await getUserTransactions(userId);
    if (transactions.length === 0) {
      return badRequest(
        "Add some transactions first to generate insights.",
        "NO_DATA",
        origin,
      );
    }

    const anthropic = await getAnthropicClient();
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: PROMPTS[type](transactions) }],
    });

    const raw = (message.content[0] as { text: string }).text
      .trim()
      .replace(/^```json\n?/, "")
      .replace(/^```\n?/, "")
      .replace(/\n?```$/, "");
    const data = JSON.parse(raw);

    return ok({ type, data }, origin);
  } catch (err) {
    console.error(
      JSON.stringify({
        level: "error",
        msg: "getInsights failed",
        requestId,
        error: String(err),
      }),
    );
    return serverError(requestId, origin);
  }
};
