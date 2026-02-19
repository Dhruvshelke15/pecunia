import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event: any) => {
  try {
    const claims = event.requestContext?.authorizer?.claims;
    if (!claims || !claims.sub) {
      return { statusCode: 401, body: JSON.stringify({ error: "Unauthorized" }) };
    }
    const userId = claims.sub;

    // --- FIX: Decode the ID ---
    // The frontend sends "REV%23date...", we need "REV#date..."
    const rawId = event.pathParameters?.id;
    if (!rawId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing entry ID" }) };
    }
    const entryId = decodeURIComponent(rawId); 

    console.log(`Attempting to delete: PK=USER#${userId}, SK=${entryId}`);

    const command = new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: `USER#${userId}`,
        SK: entryId, 
      },
    });

    await docClient.send(command);

    return {
      statusCode: 200,
      headers: { 
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "DELETE" 
      },
      body: JSON.stringify({ message: "Entry deleted successfully" }),
    };

  } catch (error: any) {
    console.error("Error deleting entry:", error);
    return { statusCode: 500, body: JSON.stringify({ error: "Failed to delete" }) };
  }
};