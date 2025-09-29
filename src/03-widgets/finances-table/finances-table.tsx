"use client";

import {ActionIcon, Button, Text, Tooltip} from "@mantine/core";
import {modals} from "@mantine/modals";
import {IconTrash} from "@tabler/icons-react";
import {
  MantineReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {useMemo, useState} from "react";
import {useAddTransaction} from "@/shared/lib/hooks/addTransaction";
import {useDeleteTransaction} from "@/shared/lib/hooks/deleteTransaction";
import {useFetchTransactions} from "@/shared/lib/hooks/fetchTransactions";
import type {Transaction} from "@/shared/types/transaction";

export function FinancesTable() {

  /* === STATES FOR VALIDATION & EDIT === */
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  //keep track of rows that have been edited
  const [editedTransactions, setEditedTransactions] = useState<Record<string, Transaction>>({});
  /* === END OF VALIDATION & EDIT STATES === */

  /* === HOOKS === */
  // READ hook
  const {
    data: fetchedTransactions = [],
    isError: isLoadingTransactionsError,
    isFetching: isFetchingTransactions,
    isLoading: isLoadingTransactions,
  } = useFetchTransactions();
  // CREATE hook
  const {mutateAsync: createTransaction, isPending: isCreatingTransaction} = useAddTransaction();

  // DELETE hook
  const {mutateAsync: deleteTransaction, isPending: isDeletingTransaction} =
    useDeleteTransaction();

  /* === END OF HOOKS === */

  /* === DEFINE TABLE COLUMN & ROWS === */
  // useMemo for stable reference to prevent infinite re-renders
  const columns = useMemo<MRT_ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        size: 120,
        mantineEditTextInputProps: ({cell, row}) => ({
          type: 'date',
          required: true,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Date is Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedTransactions({...editedTransactions, [row.id]: row.original});
          },
        }),
      },
      {
        accessorKey: 'transactionType',
        header: 'Type',
        size: 100,
        editVariant: 'select',
        mantineEditSelectProps: ({cell, row}) => ({
          data: [
            {value: 'INCOME', label: 'Income'},
            {value: 'EXPENSE', label: 'Expense'},
          ],
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Type is Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            })
          },
          // biome-ignore lint/suspicious/noExplicitAny: Following Mantine React Table docs
          onChange: (value: any) =>
            setEditedTransactions({
              ...editedTransactions,
              [row.id]: {...row.original, transactionType: value},
            }),
        }),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        size: 150,
        mantineEditTextInputProps: ({cell, row}) => ({
          type: 'text',
          required: true,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const validationError = !validateRequired(event.currentTarget.value)
              ? 'Category is Required'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedTransactions({...editedTransactions, [row.id]: row.original});
          },
        }),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        size: 100,
        Cell: ({cell}) => {
          const amount = cell.getValue<number>();
          return `£${amount?.toFixed(2) || '0.00'}`;
        },
        mantineEditTextInputProps: ({cell, row}) => ({
          type: 'number',
          step: '0.01',
          leftSection: '£',
          required: true,
          error: validationErrors?.[cell.id],
          onBlur: (event) => {
            const amount = parseFloat(event.currentTarget.value);
            const validationError = !amount || amount <= 0
              ? 'Amount must be positive'
              : undefined;
            setValidationErrors({
              ...validationErrors,
              [cell.id]: validationError,
            });
            setEditedTransactions({
              ...editedTransactions,
              [row.id]: {...row.original, amount: amount || 0}
            });
          },
        }),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 200,
        mantineEditTextInputProps: ({row}) => ({
          onBlur: (event) => {
            setEditedTransactions({
              ...editedTransactions,
              [row.id]: {...row.original, description: event.currentTarget.value},
            });
          },
        }),
      },
    ],
    [editedTransactions, validationErrors]
  );
  /* === END OF TABLE COLS & ROWS === */

  /* === TABLE ACTIONS === */
  // CREATE action
  const handleCreateTransaction: MRT_TableOptions<Transaction>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const newValidationErrors = validateTransaction(values);
    if (Object.values(newValidationErrors).some((error) => !!error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createTransaction(values);
    exitCreatingMode();
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Transaction>) => {
    console.log('Row data: ', row.original);
    console.log('Transaction ID: ', row.original.id)

    return modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete this transaction for{' '}
          <strong>£{row.original.amount?.toFixed(2)}</strong> in{' '}
          <strong>{row.original.category}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: {confirm: 'Delete', cancel: 'Cancel'},
      confirmProps: {color: 'red'},
      onConfirm: async () => {
        try {
          await deleteTransaction(row.original.id);
        } catch (error) {
          // Error is already handled in the hook
          console.error('Delete failed:', error);
        }
      },
    });
  };

  /* === END OF TABLE ACTIONS === */

  const table = useMantineReactTable({
    columns,
    data: fetchedTransactions,
    createDisplayMode: 'row',
    editDisplayMode: 'table',
    enableEditing: true,
    enableRowActions: true,
    positionActionsColumn: 'last',
    // TODO: Fix ID issue
    getRowId: (row, index) => row.id?.toString() ?? index.toString(),
    enableRowSelection: true,
    enableColumnActions: true,
    enableColumnFilters: true,
    enablePagination: true,
    enableSorting: true,
    mantineToolbarAlertBannerProps: isLoadingTransactionsError
      ? {
        color: 'red',
        children: 'Error loading data',
      }
      : undefined,
    mantineTableContainerProps: {
      style: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    onCreatingRowSave: handleCreateTransaction,
    renderRowActions: ({row}) => (
      <Tooltip label="Delete">
        <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
          <IconTrash/>
        </ActionIcon>
      </Tooltip>
    ),
    renderTopToolbarCustomActions: ({table}) => (
      <Button
        onClick={() => {
          table.setCreatingRow(true);
        }}
      >
        Add Transaction
      </Button>
    ),
    initialState: {
      sorting: [
        {
          id: 'transactionDate',
          desc: true, // (newest first)
        },
      ],
    },
    state: {
      isLoading: isLoadingTransactions,
      isSaving: isCreatingTransaction || isDeletingTransaction,
      showAlertBanner: isLoadingTransactionsError,
      showProgressBars: isFetchingTransactions,
    },
  });

  return <MantineReactTable table={table}/>;
}

const validateRequired = (value: string) => !!value?.length;

function validateTransaction(transaction: Transaction) {
  return {
    transactionDate: !validateRequired(transaction.transactionDate)
      ? 'Date is required'
      : '',
    category: !validateRequired(transaction.category)
      ? 'Category is required'
      : '',
    amount: transaction.amount <= 0
      ? 'Amount must be positive'
      : '',
  };
}