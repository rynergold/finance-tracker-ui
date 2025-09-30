import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Transaction} from "@/shared/types/transaction";

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (transaction: Transaction) => {
      const response = await fetch(`http://localhost:8080/api/transactions/${transaction.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(transaction),
      });
      
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      
      return response.text();
    },
    
    // Client side optimistic update
    onMutate: (updatedTransaction: Transaction) => {
      queryClient.setQueryData(['transactions'], (prevTransactions: Transaction[] | undefined) => {
        if (!prevTransactions) return [updatedTransaction];
        
        return prevTransactions.map((transaction) =>
          transaction.id === updatedTransaction.id ? updatedTransaction : transaction
        );
      });
    },
    
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });
}