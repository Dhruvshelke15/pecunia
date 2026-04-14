import { z } from "zod";

export const createTransactionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  amount: z.coerce
    .number()
    .positive("amount must be positive")
    .max(1_000_000, "amount too large"),
  source: z.string().min(1, "source is required").max(200, "source too long"),
  category: z.string().max(100).optional().default("Uncategorized"),
  description: z.string().max(500).optional().default(""),
  transactionType: z.enum(["income", "expense"]),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
