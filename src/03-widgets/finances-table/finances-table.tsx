"use client";
import {
  AllCommunityModule,
  type ColDef,
  ColumnAutoSizeModule,
  ModuleRegistry,
  themeQuartz
} from 'ag-grid-community';
import {AgGridReact} from 'ag-grid-react';
import {useState} from "react";
import {useFetchTransactions} from "@/widgets/finances-table/hooks/fetchTransactions";
import type {Transaction} from "@/widgets/transaction-form/transaction-form";

ModuleRegistry.registerModules([AllCommunityModule, ColumnAutoSizeModule]);


export function FinancesTable() {
  const {data: transactions, isLoading, error} = useFetchTransactions();

  const [columnDefs, setColumnDefs] = useState<ColDef<Transaction>[]>([
    {field: 'transactionDate', headerName: 'Date'},
    {field: 'transactionType', headerName: 'Type'},
    {field: 'category', headerName: 'Category'},
    {
      field: 'amount', headerName: 'Amount',
      valueFormatter: params => {
        return '£' + params.value.toLocaleString();
      }
    },
    {field: 'description', headerName: 'Description'}
  ]);

  if (error) return <div>Error loading transactions</div>;

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <AgGridReact
        theme={themeQuartz}
        rowData={transactions}
        columnDefs={columnDefs}
        loading={isLoading}
        editType="fullRow"
        autoSizeStrategy={{
          type: 'fitGridWidth',
          defaultMinWidth: 100
        }}
      />
    </div>
  );
}