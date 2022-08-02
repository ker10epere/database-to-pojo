export type DataType = [
  javaObj: string | null,
  rsObj: string | null,
  sqlType: string[] | null
];

export interface TableRow {
  columnName: string;
  javaObj: string;
  rsObj: string;
  sqlType: string[];
}
