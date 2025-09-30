import { useMutation, useQueryClient } from '@tanstack/react-query';

async function deleteCategory(id: number): Promise<void> {
  const response = await fetch(`http://localhost:8080/api/categories/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete category');
  }
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}