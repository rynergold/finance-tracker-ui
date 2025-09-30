import {z} from "zod";

export const transaction = z.object({
  id: z.number(),
  transactionDate: z.string(),
  transactionType: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.number(),
  amount: z.number().positive(),
  description: z.string().nullable(),
});

export const transactionInput = transaction.extend({
  categoryId: z.coerce.number(),
  amount: z.coerce.number().positive(),
});

export type Transaction = z.infer<typeof transaction>;
export type TransactionInput = z.infer<typeof transactionInput>;

