"use client";

import {ActionIcon, Button, Text, Tooltip} from "@mantine/core";
import {modals} from "@mantine/modals";
import {IconEdit, IconTrash} from "@tabler/icons-react";
import {
  MantineReactTable, type MRT_ColumnDef, type MRT_Row, type MRT_TableOptions,
  useMantineReactTable,
} from 'mantine-react-table';
import {useMemo, useState} from "react";
import {ManageCategoriesModal} from "@/features/ManageCategoriesModal";
import {useAddTransaction} from "@/shared/lib/hooks/addTransaction";
import {useDeleteTransaction} from "@/shared/lib/hooks/deleteTransaction";
import {useFetchCategories} from "@/shared/lib/hooks/fetchCategories";
import {useFetchTransactions} from "@/shared/lib/hooks/fetchTransactions";
import {useUpdateTransaction} from "@/shared/lib/hooks/updateTransaction";
import {type Transaction, transactionInput} from "@/shared/types/transaction";
import {useDeleteTransactions} from "@/shared/lib/hooks/deleteTransactions";

export function FinancesTable() {

  /* === STATES FOR VALIDATION & EDIT === */
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});
  const [manageCategoriesOpened, setManageCategoriesOpened] = useState(false);
  /* === END OF VALIDATION & EDIT STATES === */

  /* === HOOKS === */
  /* == TRANSACTIONS == */
  // READ hook
  const {
    data: fetchedTransactions = [],
    isError: isLoadingTransactionsError,
    isFetching: isFetchingTransactions,
    isLoading: isLoadingTransactions,
  } = useFetchTransactions();
  // CREATE hook
  const {mutateAsync: createTransaction, isPending: isCreatingTransaction} = useAddTransaction();

  // UPDATE hook
  const {mutateAsync: updateTransaction, isPending: isUpdatingTransaction} = useUpdateTransaction();

  // DELETE hook
  const {mutateAsync: deleteTransaction, isPending: isDeletingTransaction} =
    useDeleteTransaction();

  // BULK DELETE hook
  const {mutateAsync: deleteTransactions, isPending: isDeletingTransactions} =
    useDeleteTransactions();

  /* == CATEGORIES == */
  const {data: categories = [], isLoading: isLoadingCategories} = useFetchCategories();

  /* === END OF HOOKS === */

  /* === DEFINE TABLE COLUMN & ROWS === */
  // useMemo for stable reference to prevent infinite re-renders
  const columns = useMemo<MRT_ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: 'transactionDate',
        header: 'Date',
        size: 120,
        mantineEditTextInputProps: () => ({
          type: 'date',
          required: true,
        }),
      },
      {
        accessorKey: 'transactionType',
        header: 'Type',
        size: 100,
        editVariant: 'select',
        mantineEditSelectProps: () => ({
          data: [
            {value: 'INCOME', label: 'Income'},
            {value: 'EXPENSE', label: 'Expense'},
          ],
        }),
      },
      {
        accessorKey: 'categoryId',
        header: 'Category',
        size: 150,
        editVariant: 'select',
        Cell: ({cell}) => {
          const categoryId = cell.getValue<number>();
          const category = categories.find(c => c.id === categoryId);
          return category?.categoryName || 'Unknown';
        },
        mantineEditSelectProps: () => ({
          data: categories.map(cat => ({
            value: cat.id.toString(),
            label: cat.categoryName,
          })),
          required: true,
          searchable: true,
          disabled: isLoadingCategories,
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
        mantineEditTextInputProps: () => ({
          type: 'number',
          step: '0.01',
          leftSection: '£',
          required: true,
        }),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 200,
      },
    ],
    [categories, isLoadingCategories]
  );
  /* === END OF TABLE COLS & ROWS === */

  /* === TABLE ACTIONS === */
  // CREATE action
  const handleCreateTransaction: MRT_TableOptions<Transaction>['onCreatingRowSave'] = async ({
    values,
    exitCreatingMode,
  }) => {
    const result = transactionInput.safeParse(values);

    if (!result.success) {
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          zodErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setValidationErrors(zodErrors);
      return;
    }

    setValidationErrors({});
    await createTransaction(result.data as Transaction);
    exitCreatingMode();
  };

  const handleSaveTransaction: MRT_TableOptions<Transaction>['onEditingRowSave'] = async ({
    values,
    table,
    row,
  }) => {
    const dataToValidate = {
      ...values,
      id: row.original.id,
    };

    const result = transactionInput.safeParse(dataToValidate);

    if (!result.success) {
      console.error('Transaction validation failed:', result.error.issues);
      const zodErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          zodErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setValidationErrors(zodErrors);
      return;
    }

    setValidationErrors({});

    try {
      await updateTransaction(result.data as Transaction);
      table.setEditingRow(null);
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Transaction>) => {
    const category = categories.find(c => c.id === row.original.categoryId);

    return modals.openConfirmModal({
      title: 'Are you sure you want to delete this user?',
      children: (
        <Text>
          Are you sure you want to delete this transaction for{' '}
          <strong>£{row.original.amount?.toFixed(2)}</strong> in{' '}
          <strong>{category?.categoryName || 'Unknown'}</strong>? This action cannot be undone.
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

  const openBulkDeleteConfirmModal = (rows: MRT_Row<Transaction>[]) => {
    const totalAmount = rows.reduce((sum, row) => sum + (row.original.amount || 0), 0);

    return modals.openConfirmModal({
      title: 'Delete Multiple Transactions',
      children: (
        <Text>
          Are you sure you want to
          delete <strong>{rows.length}</strong> transaction{rows.length === 1 ? '' : 's'}
          {' '}totaling <strong>£{totalAmount.toFixed(2)}</strong>? This action cannot be undone.
        </Text>
      ),
      labels: {confirm: 'Delete All', cancel: 'Cancel'},
      confirmProps: {color: 'red'},
      onConfirm: async () => {
        try {
          const ids = rows.map(row => row.original.id);
          await deleteTransactions(ids);
          table.resetRowSelection();
        } catch (error) {
          console.error('Bulk delete failed:', error);
        }
      },
    });
  };

  /* === END OF TABLE ACTIONS === */

  const table = useMantineReactTable({
    columns,
    data: fetchedTransactions,
    createDisplayMode: 'row',
    editDisplayMode: 'row',
    mantineTableBodyRowProps: ({row, table}) => ({
      onDoubleClick: () => {
        table.setEditingRow(row);
      },
      style: {cursor: 'pointer'},
    }),
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
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveTransaction,
    renderRowActions: ({row, table}) => (
      <div style={{display: 'flex', gap: '8px'}}>
        <Tooltip label="Edit">
          <ActionIcon onClick={() => table.setEditingRow(row)}>
            <IconEdit/>
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon color="red" onClick={() => openDeleteConfirmModal(row)}>
            <IconTrash/>
          </ActionIcon>
        </Tooltip>
      </div>
    ),
    renderTopToolbarCustomActions: ({table}) => {
      const selectedRows = table.getSelectedRowModel().rows;
      return (
        <div style={{display: 'flex', gap: '8px'}}>
          <Button onClick={() => table.setCreatingRow(true)}>
            Add Transaction
          </Button>
          <Button
            variant="light"
            onClick={() => setManageCategoriesOpened(true)}
          >
            Manage Categories
          </Button>
          {selectedRows.length > 0 && (
            <Button
              color="red"
              leftSection={<IconTrash size={16}/>}
              onClick={() => openBulkDeleteConfirmModal(selectedRows)}
            >
              Delete {selectedRows.length} Selected
            </Button>
          )}
        </div>
      );
    },
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
      isSaving: isCreatingTransaction || isUpdatingTransaction || isDeletingTransaction || isDeletingTransactions,
      showAlertBanner: isLoadingTransactionsError,
      showProgressBars: isFetchingTransactions,
    },
  });

  return (
    <>
      <MantineReactTable table={table}/>
      <ManageCategoriesModal
        opened={manageCategoriesOpened}
        onClose={() => setManageCategoriesOpened(false)}
      />
    </>
  );
}