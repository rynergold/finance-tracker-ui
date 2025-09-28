'use client'

import {Button, NumberInput, Select, Stack, Textarea, TextInput } from '@mantine/core';
import {DateInput} from "@mantine/dates";
import {useState} from "react";
import {z} from 'zod';
import {useAddTransaction} from "@/widgets/transaction-form/hooks/addTransaction";

export const transaction = z.object({
  transactionDate: z.string(),
  transactionType: z.enum(['INCOME', 'EXPENSE']),
  category: z.string(),
  amount: z.number().positive(),
  description: z.string().nullable(),
});

export type Transaction = z.infer<typeof transaction>;

export interface TransactionFormData {
  transactionDate: string;
  transactionType: string;
  category: string;
  amount: number;
  description: string;
}

export function TransactionForm() {
  const mutation = useAddTransaction();
  const [formData, setFormData] = useState<TransactionFormData>({
    transactionDate: '',
    transactionType: '',
    category: '',
    amount: 0.00,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await mutation.mutateAsync({
      ...formData,
      transactionType: formData.transactionType as 'INCOME' | 'EXPENSE',
      description: formData.description || null
    });

    setFormData({
      transactionDate: '',
      transactionType: '',
      category: '',
      amount: 0.00,
      description: '',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        <DateInput
          label="Transaction Date"
          placeholder="Select date"
          value={formData.transactionDate ? new Date(formData.transactionDate) : null}
          onChange={(value) => setFormData({
            ...formData,
            transactionDate: value || ''
          })}
          required
        />

        <Select
          label="Transaction Type"
          placeholder="Select type"
          data={[
            { value: 'INCOME', label: 'Income' },
            { value: 'EXPENSE', label: 'Expense' }
          ]}
          value={formData.transactionType}
          onChange={(value) => setFormData({...formData, transactionType: value || ''})}
          required
        />

        <TextInput
          label="Category"
          placeholder="Enter category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          required
        />

        <NumberInput
          label="Amount"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(value) => setFormData({...formData, amount: Number(value) || 0})}
          prefix="£"
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          required
        />

        <Textarea
          label="Description"
          placeholder="Enter description (optional)"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          autosize
          minRows={2}
        />

        <Button type="submit" loading={mutation.isPending}>
          Add
        </Button>
      </Stack>
    </form>
  )
}