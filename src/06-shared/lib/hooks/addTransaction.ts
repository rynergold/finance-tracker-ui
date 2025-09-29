import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Transaction} from "@/shared/types/transaction";

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      const response = await fetch('http://localhost:8080/transaction', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(transaction),
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      return response.text();
    },

    // Client side optimistic update
    onMutate: (newTransaction: Transaction) => {
      queryClient.setQueryData(['transactions'], (prevTransactions: Transaction[] | undefined) => {
        if (!prevTransactions) return [newTransaction];
        return [...prevTransactions, newTransaction];
      });
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}