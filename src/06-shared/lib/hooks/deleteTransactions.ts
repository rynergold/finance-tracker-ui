import {notifications} from "@mantine/notifications";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import type {Transaction} from "@/shared/types/transaction";

export function useDeleteTransactions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ids: number[]) => {
      const params = new URLSearchParams();
      ids.forEach(id => {
        params.append('ids', id.toString());
      });
      
      const response = await fetch(
        `http://localhost:8080/api/transactions?${params.toString()}`,
        {
          method: 'DELETE',
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete transactions');
      }
      
      return response.json().catch(() => ({}));
    },
    
    // Optimistic update
    onMutate: async (transactionIds) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({queryKey: ['transactions']});
      
      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);
      
      // Optimistically remove all selected transactions
      queryClient.setQueryData(['transactions'], (old: Transaction[]) =>
        old?.filter((t) => !transactionIds.includes(t.id))
      );
      
      return {previousTransactions};
    },
    
    onSuccess: (_data, ids) => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({queryKey: ['transactions']});
      
      // Show success notification
      notifications.show({
        title: 'Success',
        message: `${ids.length} transaction${ids.length === 1 ? '' : 's'} deleted successfully`,
        color: 'green',
      });
    },
    
    onError: (error, _ids, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }
      
      // Show error notification
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete transactions',
        color: 'red',
      });
    },
  });
}