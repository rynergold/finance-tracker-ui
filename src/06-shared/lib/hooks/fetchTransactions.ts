import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { type Transaction, transaction } from "@/shared/types/transaction";

const transactionsResponse = z.array(transaction);

export const fetchTransactions = async (): Promise<Transaction[]> => {
  const response = await fetch('http://localhost:8080/transactions');

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  // Validate response with Zod
  // noinspection UnnecessaryLocalVariableJS
  const validated = transactionsResponse.parse(data);
  return validated;
};

export function useFetchTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}