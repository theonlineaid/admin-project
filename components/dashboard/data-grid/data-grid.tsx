"use client";

import { useCallback, useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef } from "ag-grid-community";
import { cn } from "@/lib/utils";
import type { DataGridProps } from "./data-grid-types";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import "./data-grid.css";

const defaultPageSizes = [10, 25, 50, 100];

const defaultRowHeight = 46;
const defaultHeaderHeight = 44;

export function DataGrid<TData = unknown>({
  rowData,
  columnDefs,
  height = 480,
  className,
  defaultColDef: userDefaultColDef,
  pagination = true,
  paginationPageSize = 10,
  paginationPageSizeSelector = defaultPageSizes,
  rowHeight = defaultRowHeight,
  headerHeight = defaultHeaderHeight,
  animateRows = true,
  context,
  loading,
  getRowId,
  domLayout = "normal",
}: DataGridProps<TData>) {
  const [gridHost, setGridHost] = useState<HTMLDivElement | null>(null);
  const gridHostRef = useCallback((node: HTMLDivElement | null) => {
    setGridHost(node);
  }, []);

  const defaultColDef = useMemo<ColDef<TData>>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      flex: 1,
      minWidth: 100,
      ...userDefaultColDef,
    }),
    [userDefaultColDef]
  );

  const heightStyle =
    typeof height === "number" ? `${height}px` : height === "auto" ? "auto" : height;

  return (
    <div
      ref={gridHostRef}
      className={cn(
        "dashboard-ag-grid ag-theme-quartz w-full overflow-hidden rounded-xl border border-border/90 bg-card shadow-sm",
        "[&_.ag-root-wrapper]:overflow-hidden [&_.ag-root-wrapper]:rounded-xl [&_.ag-root-wrapper]:shadow-none",
        className
      )}
      style={{ height: domLayout === "autoHeight" ? "auto" : heightStyle, minHeight: domLayout === "autoHeight" ? 120 : undefined }}
    >
      <AgGridReact<TData>
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        pagination={pagination}
        paginationPageSize={paginationPageSize}
        paginationPageSizeSelector={paginationPageSizeSelector}
        rowHeight={rowHeight}
        headerHeight={headerHeight}
        animateRows={animateRows}
        context={context}
        loading={loading}
        getRowId={getRowId}
        domLayout={domLayout}
        suppressCellFocus
        popupParent={gridHost ?? undefined}
      />
    </div>
  );
}
