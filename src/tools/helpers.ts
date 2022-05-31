import { camelCase, pascalCase } from 'change-case';
import { TableRow } from '../..';

const generateGetResultSetObjects = (tableRows: TableRow[]): string[] => {
  return tableRows.map(
    ({ columnName, javaObj, rsObj }) =>
      `${generateDeclaration(columnName, javaObj)} = ${generateGetResultSet(
        rsObj,
        columnName
      )};`
  );
};

const generateGetResultSet = (rsObj: string, columnName: string) => {
  const rsGet: string = `rs.${rsObj}`;
  return rsGet.replace('$$$', columnName);
};

const generateDeclaration = (column_name: string, javaObj: string) => {
  return `${javaObj} ${camelCase(column_name)}`;
};

const generateSQLUpdateQuery = (tableName: string, tableRows: TableRow[]) => {
  const columnNames = tableRows
    .map(({ columnName }) => columnName)
    .filter((columnName) => columnName !== 'id');

  const coalesces = columnNames.map(
    (columnName) => `${getCoalesce(columnName)}`
  );

  return `UPDATE ${tableName} SET ${coalesces.join(', ')} WHERE id = ? ;`;
};

const getFindListConsumer = (columnName: string): string =>
  `item.find${pascalCase(
    columnName
  )}().ifPresent(listConsumer("${columnName}", sb::append, values::add));`;

const getValuesAdd = (columnName: string): string =>
  `values.add(item.get${pascalCase(columnName)}());`;

const arrayToParens = (strings: string[]): string => strings.join(', ');

const getCoalesce = (columnName: string): string =>
  `${columnName}=COALESCE( ? , ${columnName})`;

export { generateGetResultSetObjects, generateSQLUpdateQuery };
