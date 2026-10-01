import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// Replace with your actual table name from CDK outputs
const TABLE_NAME = process.env.TABLE_NAME!;

async function backfill() {
  let lastKey: Record<string, unknown> | undefined;
  let processed = 0;

  do {
    const response = await docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "attribute_not_exists(GSI1PK)",
        ExclusiveStartKey: lastKey,
      }),
    );

    const items = response.Items ?? [];
    console.log(`Found ${items.length} items to backfill`);

    for (const item of items) {
      if (!item.PK || !item.SK || !item.category || !item.date) continue;

      const userId = (item.PK as string).replace("USER#", "");
      const skParts = (item.SK as string).split("#");
      const uuid = skParts[skParts.length - 1];

      await docClient.send(
        new UpdateCommand({
          TableName: TABLE_NAME,
          Key: { PK: item.PK, SK: item.SK },
          UpdateExpression: "SET GSI1PK = :gsi1pk, GSI1SK = :gsi1sk",
          ExpressionAttributeValues: {
            ":gsi1pk": `USER#${userId}#CATEGORY#${item.category}`,
            ":gsi1sk": `${item.date}#${uuid}`,
          },
        }),
      );

      processed++;
    }

    lastKey = response.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  console.log(`Backfill complete. Processed ${processed} items.`);
}

backfill().catch(console.error);
