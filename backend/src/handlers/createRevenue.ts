import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.TABLE_NAME;

export const handler = async (event: any) => {
  try {
    // Log the full event to debug the structure in CloudWatch
    console.log("FULL EVENT:", JSON.stringify(event, null, 2));

    // USER ID EXTRACTION
    let userId = "test-user-fallback";

    // Checking if the request came from API Gateway with a Cognito Authorizer
    if (event.requestContext && event.requestContext.authorizer && event.requestContext.authorizer.claims) {
      userId = event.requestContext.authorizer.claims.sub;
      console.log("User ID found in Authorizer claims:", userId);
    } else {
      console.warn("WARNING: No Authorizer claims found. Using fallback ID.");
    }

    // BODY PARSING
    let body = event.body;
    
    if (!body) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "No body provided" }) 
      };
    }

    // API Gateway sometimes sends the body as a string, sometimes as an object
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return { 
          statusCode: 400, 
          body: JSON.stringify({ error: "Invalid JSON body" }) 
        };
      }
    }

    const { date, amount, source, category, description, transactionType } = body;

    // Basic Validation
    if (!date || !amount || !source) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing required fields: date, amount, source" }) 
      };
    }
    

    // DYNAMODB WRITE
    const command = new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        PK: `USER#${userId}`,
        SK: `REV#${date}#${randomUUID()}`,
        type: "Revenue",
        transactionType: transactionType || "income",
        date,
        amount: Number(amount),
        source,
        category: category || "Uncategorized",
        description: description || "",
        createdAt: new Date().toISOString()
      },
    });

    await docClient.send(command);

    return {
      statusCode: 201,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: JSON.stringify({ message: "Revenue entry created successfully", id: userId }),
    };

  } catch (error: any) {
    console.error("CRITICAL ERROR:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
    };
  }
};