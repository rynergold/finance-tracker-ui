import {useQuery} from "@tanstack/react-query";

export const fetchTransactions = async () => {
  const response = await fetch('http://localhost:8080/transactions');
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

export function useFetchTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions
  });
}