import {useMutation} from "@tanstack/react-query";
import type {Transaction} from "@/widgets/transaction-form/transaction-form";

export const addTransaction = async (transaction: Transaction) => {
  const response = await fetch('http://localhost:8080/transaction', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(transaction),
  })
  if (!response.ok) {
    throw new Error(response.statusText)
  }
  return response.json()
}

export function useAddTransaction() {
  return useMutation({
    mutationFn: addTransaction
  })
}