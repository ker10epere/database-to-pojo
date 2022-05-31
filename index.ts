import { readFileSync } from 'fs';
import { outputFileSync } from 'fs-extra';
import { Pool, PoolConfig } from 'pg';
import { getCurrentDate, getCurrentTime } from './src/tools/formated-date';
import { generateSQLUpdateQuery } from './src/tools/helpers';

interface DBConf extends PoolConfig {
  tables: string[];
}

const dbConfig: DBConf = JSON.parse(readFileSync('./db-config.json', 'utf8'));

interface ColumnType {
  column_name: string;
  data_type: string;
}

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

const dataTypes: DataType[] = [
  ['String', 'getString("$$$")', ['text']],
  ['Long', 'getLong("$$$")', ['bigint']],
  ['BigDecimal', 'getBigDecimal("$$$")', ['numeric']],
  ['Integer', 'getInt("$$$")', ['integer']],
  [
    'LocalDateTime',
    'getObject("$$$", LocalDateTime.class)',
    ['timestamp without time zone'],
  ],
  [
    'LocalTime',
    'getObject("$$$", LocalTime.class)',
    ['time without time zone'],
  ],
  ['LocalDate', 'getObject("$$$", LocalDate.class)', ['date']],
];

dbConfig.tables.forEach((tableName) => {
  const pool = new Pool(dbConfig);
  pool.query(
    `SELECT column_name, data_type FROM information_schema.COLUMNS WHERE table_name = '${tableName}';`,
    async (err, res: { rows: ColumnType[] }) => {
      try {
        if (err) return console.log(err);

        outputFileSync(
          `./logs/${getCurrentDate()}.jsonc`,
          `//[${getCurrentTime()}] ${tableName} \n${JSON.stringify(
            res.rows
          )}\n`,
          {
            flag: 'a',
            encoding: 'utf8',
          }
        );

        const tableRows: TableRow[] = res.rows.map(
          ({ column_name: columnName, data_type }): TableRow => {
            const dataTypeIndex = dataTypes.findIndex((o) =>
              o[2]!.includes(data_type)
            );

            if (dataTypeIndex === -1) {
              return { columnName, javaObj: '', rsObj: '', sqlType: [] };
            }

            const foundDataType = dataTypes[dataTypeIndex];

            const javaObj = foundDataType[0]!;
            const rsObj = foundDataType[1]!;
            const sqlType = [...foundDataType[2]!];

            return { columnName, javaObj, rsObj, sqlType };
          }
        );

        // add logic below
        // const result = generateGetResultSetObjects(tableRows);
        const result = generateSQLUpdateQuery(tableName, tableRows);
        console.log(result);
      } finally {
        pool.end();
      }
    }
  );
});
