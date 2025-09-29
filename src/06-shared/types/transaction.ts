import {z} from "zod";

export const transaction = z.object({
  id: z.number(),
  transactionDate: z.string(),
  transactionType: z.enum(['INCOME', 'EXPENSE']),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string().nullable(),
});

export type Transaction = z.infer<typeof transaction>;

