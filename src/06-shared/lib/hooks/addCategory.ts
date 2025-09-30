import { useMutation, useQueryClient } from '@tanstack/react-query';
import {type Category, type CreateCategoryInput, createCategorySchema} from "@/shared/types/category";

async function createCategory(data: CreateCategoryInput): Promise<Category> {
  const validated = createCategorySchema.parse(data);
  
  const response = await fetch('http://localhost:8080/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validated),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create category');
  }
  
  return response.json();
}

export function useAddCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}