import { z } from 'zod';

export const categorySchema = z.object({
  id: z.number(),
  categoryName: z.string().min(1, 'Category name is required'),
});

export type Category = z.infer<typeof categorySchema>;

export const createCategorySchema = categorySchema.omit({ id: true });
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;