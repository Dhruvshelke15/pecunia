// shared/types.ts

export type TransactionType = "income" | "expense";

export interface TransactionItem {
  PK: string; // USER#<userId>
  SK: string; // TXN#<date>#<uuid>
  type: "Transaction";
  transactionType: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  amount: number;
  source: string;
  category: string;
  description: string;
  createdAt: string; // ISO datetime
}

// What the API returns to the client (strips internal DynamoDB keys)
export interface TransactionDTO {
  id: string; // the SK, URL-safe
  transactionType: TransactionType;
  date: string;
  amount: number;
  source: string;
  category: string;
  description: string;
  createdAt: string;
}

// POST /revenue request body
export interface CreateTransactionBody {
  date: string;
  amount: number;
  source: string;
  category?: string;
  description?: string;
  transactionType: TransactionType;
}

// GET /revenue response (paginated)
export interface GetTransactionsResponse {
  items: TransactionDTO[];
  nextCursor?: string; // base64-encoded LastEvaluatedKey
}

// Standard API error shape
export interface ApiError {
  error: string;
  code: string;
  requestId?: string;
}
