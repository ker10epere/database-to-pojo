import { camelCase, pascalCase } from 'change-case';
import { TableRow } from '../classes/database.interfaces';

const generateJavaPropertyNames = (tableRows: TableRow[]): string[] => {
  return tableRows.map(({ columnName }) => camelCase(columnName));
};

const generateGetResultSetObjects = (tableRows: TableRow[]): string[] => {
  return tableRows.map(
    ({ columnName, javaObj, rsObj }) =>
      `${generateDeclaration(columnName, javaObj)} = ${generateGetResultSet(
        columnName,
        rsObj
      )};`
  );
};

const generateGetResultSet = (columnName: string, rsObj: string): string => {
  const rsGet: string = `rs.${rsObj}`;
  return rsGet.replace('$$$', columnName);
};

const generateDeclaration = (column_name: string, javaObj: string): string => {
  return `${javaObj} ${camelCase(column_name)}`;
};

const generateSBUpdateQuery = (tableRows: TableRow[]): string => {
  const columnNames = tableRows
    .map(({ columnName }) => columnName)
    .filter((columnName) => columnName !== 'id');

  const coalesces = columnNames.map(
    (columnName) => `${getCoalesce(columnName)}`
  );

  const setColumnsWithCoalesce = coalesces.join(', ');

  return `final StringBuilder sb =  new StringBuilder("UPDATE ").append(tableName).append(" SET ${setColumnsWithCoalesce} ").append(" WHERE id = ? ;");`;
};

const generateSBInsertQuery = (tableRows: TableRow[]): string => {
  const columns = tableRows
    .map(({ columnName }) => columnName)
    .filter((columnName) => columnName !== 'id');

  const insertColumns = columns.join(', ');
  const insertPlaceHolders = new Array(5).fill('?').join(', ');

  return `final StringBuilder sb =  new StringBuilder("INSERT INTO ").append(tableName).append(" (${insertColumns}) ").append(" VALUES (${insertPlaceHolders}) ;");`;
};

const generateSBListQuery = (tableRows: TableRow[]): string => {
  const columns = tableRows.map(({ columnName }) => columnName).join(', ');

  return `final StringBuilder sb =  new StringBuilder("SELECT ${columns} FROM ").append(tableName).append(" WHERE 1=1 ") ;`;
};

const generateSBDeleteQuery = () => {
  return `final StringBuilder sb =  new StringBuilder("DELETE FROM ").append(tableName).append("  WHERE 1=1 ").append("  AND id = ? ");`;
};

const generateSQLUpdateQuery = (
  tableName: string,
  tableRows: TableRow[]
): string => {
  const columnNames = tableRows
    .map(({ columnName }) => columnName)
    .filter((columnName) => columnName !== 'id');

  const coalesces = columnNames.map(
    (columnName) => `${getCoalesce(columnName)}`
  );

  const setColumnsWithCoalesce = coalesces.join(', ');

  return `UPDATE ${tableName} SET ${setColumnsWithCoalesce} WHERE id = ? ;`;
};

const generateSQLInsertQuery = (
  tableName: string,
  tableRows: TableRow[]
): string => {
  const columns = tableRows
    .map(({ columnName }) => columnName)
    .filter((columnName) => columnName !== 'id');

  const insertColumns = columns.join(', ');
  const insertPlaceHolders = new Array(5).fill('?').join(', ');

  return `INSERT INTO ${tableName}(${insertColumns}) VALUES (${insertPlaceHolders}) ;`;
};

const generateSQLListQuery = (
  tableName: string,
  tableRows: TableRow[]
): string => {
  const columns = tableRows.map(({ columnName }) => columnName).join(', ');

  return `SELECT ${columns} FROM ${tableName} WHERE 1=1 `;
};

const generateSQLDeleteQuery = (tableName: string): string => {
  return `DELETE FROM ${tableName} WHERE 1=1 AND id = ?`;
};

const getFindListConsumer = (columnName: string): string =>
  `item.find${pascalCase(
    columnName
  )}().ifPresent(listConsumer("${columnName}", sb::append, values::add));`;

const getFindListConsumers = (tableRows: TableRow[]): string[] => {
  return tableRows.map(({ columnName }) => getFindListConsumer(columnName));
};

const getValuesAdd = (columnName: string): string =>
  `values.add(item.get${pascalCase(columnName)}());`;

const arrayToParens = (strings: string[]): string => strings.join(', ');

const getCoalesce = (columnName: string): string =>
  `${columnName}=COALESCE( ? , ${columnName})`;

export {
  getValuesAdd,
  generateJavaPropertyNames,
  generateGetResultSetObjects,
  getFindListConsumers,
  generateSQLUpdateQuery,
  generateSQLInsertQuery,
  generateSQLListQuery,
  generateSQLDeleteQuery,
  generateSBUpdateQuery,
  generateSBInsertQuery,
  generateSBListQuery,
  generateSBDeleteQuery,
};
