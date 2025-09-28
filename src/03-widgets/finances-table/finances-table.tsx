"use client";
import {
  AllCommunityModule,
  type ColDef,
  ColumnAutoSizeModule,
  type EditableCallbackParams,
  type GetRowIdParams,
  ModuleRegistry,
  PinnedRowModule,
  type RowEditingStoppedEvent,
  SelectEditorModule,
  themeQuartz
} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {useCallback, useMemo, useRef, useState} from "react";
import {useFetchTransactions} from "@/widgets/finances-table/hooks/fetchTransactions";
import {useAddTransaction} from "@/widgets/transaction-form/hooks/addTransaction";
import type {Transaction} from "@/widgets/transaction-form/transaction-form";

ModuleRegistry.registerModules([AllCommunityModule, ColumnAutoSizeModule, PinnedRowModule, SelectEditorModule]);

const formatCurrencyGBP = (amount: number | null | undefined): string => {
  if (amount == null) return '';
  return `£${amount.toLocaleString()}`;
};

export function FinancesTable() {
  const gridRef = useRef<AgGridReact>(null);
  const {data = [], isLoading, error, refetch} = useFetchTransactions();
  const {mutate: addTransaction} = useAddTransaction();
  const [pinnedTopRowData, setPinnedTopRowData] = useState([]);

  const columnDefs = useState<ColDef<Transaction>[]>([
    {field: 'transactionDate', headerName: 'Date'},
    {
      field: 'transactionType',
      headerName: 'Type',
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: ['INCOME', 'EXPENSE']
      }
    },
    {field: 'category', headerName: 'Category'},
    {
      field: 'amount',
      headerName: 'Amount',
      valueFormatter: params => formatCurrencyGBP(params.value)
    },
    {field: 'description', headerName: 'Description'}
  ])[0];

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      editable: (params: EditableCallbackParams) => {
        return params.node.id === 'new-transaction';
      },
    };
  }, []);

  const getRowId = useCallback((params: GetRowIdParams) =>
      params.data.id?.toString() ?? 'new-transaction',
    []);

  const addNewTransaction = useCallback(() => {
    const {api} = gridRef.current || {};
    if (!api) return;

    api.setGridOption("pinnedTopRowData", [
      {
        transactionDate: null,
        transactionType: null,
        category: null,
        amount: null,
        description: null
      },
    ]);

    setTimeout(() => {
      api.startEditingCell({
        rowIndex: 0,
        rowPinned: "top",
        colKey: "transactionDate",
      });
    });
  }, []);

  const onRowEditingStopped = useCallback(
    (params: RowEditingStoppedEvent) => {
      const {data: newTransaction} = params;

      setPinnedTopRowData([]);

      if (newTransaction.transactionDate == null) {
        return;
      }

      console.log('Adding transaction:', newTransaction);

      addTransaction(newTransaction, {
        onSuccess: () => {
          console.log('Transaction saved successfully, refetching...');
          refetch();
        },
        onError: (error) => {
          console.error('Failed to save transaction:', error);
        }
      });
    },
    [addTransaction, refetch],
  );

  if (error) return <div>Error loading transactions</div>;

  return (
    <div style={{width: "100%", height: "600px"}}>
      <button type="button" onClick={addNewTransaction}>Add New Transaction</button>
      <AgGridReact
        ref={gridRef}
        theme={themeQuartz}
        rowData={data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        loading={isLoading}
        editType="fullRow"
        getRowId={getRowId}
        pinnedTopRowData={pinnedTopRowData}
        onRowEditingStopped={onRowEditingStopped}
        autoSizeStrategy={{
          type: 'fitGridWidth',
          defaultMinWidth: 100
        }}
      />
    </div>
  );
}