import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import {Transaction} from "@/shared/types/transaction";

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(
        `http://localhost:8080/transaction/${id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete transaction');
      }

      return response.json().catch(() => ({})); // Handle empty responses
    },

    // Optimistic update
    onMutate: async (transactionId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['transactions'] });

      // Snapshot previous value
      const previousTransactions = queryClient.getQueryData(['transactions']);

      // Optimistically update
      queryClient.setQueryData(['transactions'], (old: Transaction[]) =>
        old?.filter((t) => t.id !== transactionId)
      );

      return { previousTransactions };
    },

    onSuccess: () => {
      // Invalidate and refetch
      void queryClient.invalidateQueries({ queryKey: ['transactions'] });

      // Show success notification
      notifications.show({
        title: 'Success',
        message: 'Transaction deleted successfully',
        color: 'green',
      });
    },

    onError: (error, _id, context) => {
      // Rollback on error
      if (context?.previousTransactions) {
        queryClient.setQueryData(['transactions'], context.previousTransactions);
      }

      // Show error notification
      notifications.show({
        title: 'Error',
        message: error.message || 'Failed to delete transaction',
        color: 'red',
      });
    },
  });
}