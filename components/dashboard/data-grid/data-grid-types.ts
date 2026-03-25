import type { ColDef } from "ag-grid-community";

export type DataGridActionsContext = {
  onEdit?: (row: unknown) => void;
  onDelete?: (id: string) => void;
};

export type DataGridProps<TData = unknown> = {
  rowData: TData[];
  columnDefs: ColDef<TData>[];
  /** Fixed height, e.g. 420 or "50vh". Default 480px. */
  height?: number | string;
  className?: string;
  /** Merged into every column (sortable, filter, etc.). */
  defaultColDef?: ColDef<TData>;
  /** Client-side pagination inside the grid. */
  pagination?: boolean;
  paginationPageSize?: number;
  paginationPageSizeSelector?: number[] | boolean;
  rowHeight?: number;
  headerHeight?: number;
  animateRows?: boolean;
  /** Passed to AG Grid context (e.g. action callbacks). */
  context?: Record<string, unknown>;
  loading?: boolean;
  /** Stable row id field for selection / updates. */
  getRowId?: (params: { data: TData }) => string;
  domLayout?: "normal" | "autoHeight" | "print";
};
