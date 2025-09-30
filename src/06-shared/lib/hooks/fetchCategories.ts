import { useQuery } from '@tanstack/react-query';
import type {Category} from "@/shared/types/category";

async function getCategories(): Promise<Category[]> {
  const response = await fetch('http://localhost:8080/api/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

export function useFetchCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });
}