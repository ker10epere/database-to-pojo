import {pascalCase} from 'change-case';
import {readFileSync} from 'fs';
import {outputFileSync} from 'fs-extra';
import {Pool, PoolConfig} from 'pg';
import {DataType, TableRow} from './interfaces/database.interfaces';
import {repositoryImpl} from './classes/repository/repository-impl';
import {DirectoryType, generateDirOutputPath} from './tools/dirPath';
import {getCurrentDate, getCurrentTime, getCurrentTimestamp,} from './tools/formated-date';

interface DBConf extends PoolConfig {
    tables: string[];
}

const dbConfig: DBConf = JSON.parse(readFileSync('./db-config.json', 'utf8'));

interface ColumnType {
    column_name: string;
    data_type: string;
}

const dataTypes: DataType[] = [
    ['String', 'getString("$$$")', ['text']],
    ['Long', 'getLong("$$$")', ['bigint']],
    ['BigDecimal', 'getBigDecimal("$$$")', ['numeric']],
    ['Integer', 'getInt("$$$")', ['integer']],
    ['Timestamp', 'getObject("$$$", Timestamp.class)', ['timestamp with time zone'],],
    ['LocalTime', 'getObject("$$$", LocalTime.class)', ['time without time zone'],],
    ['LocalDate', 'getObject("$$$", LocalDate.class)', ['date']],
];

dbConfig.tables.forEach((tableName) => {
    const pool = new Pool(dbConfig);
    pool.query(
        `SELECT column_name, data_type FROM information_schema.COLUMNS WHERE table_name = '${tableName}';`,
        async (err, {rows}: { rows: ColumnType[] }) => {
            try {
                if (err) return console.log(err);
                const pascalTableName = pascalCase(tableName);
                saveLogs({rows, tableName})

                const tableRows: TableRow[] = rows.map(row =>  mapColumnTypeToRow(row));

                const repositoryImplData = repositoryImpl(tableRows).replaceAll(
                    '##CLASSNAME##',
                    pascalTableName.substring(0,pascalTableName.length - 1)
                );

                const repositoryImplPath = generateDirOutputPath(
                    DirectoryType.RepositoryImpl,
                    `${pascalTableName}RepositoryImpl-${getCurrentTimestamp()}.java`,
                    pascalTableName
                );
                save({data: repositoryImplData, filePath: repositoryImplPath});
            } finally {
                pool.end();
            }
        }
    );
});

const save = ({
                  data,
                  filePath,
                  flag,
              }: {
    filePath: string;
    data: string;
    flag?: string;
}) => {
    outputFileSync(filePath, data, {flag, encoding: 'utf8'});
};

function saveLogs({tableName, rows}: { tableName: string, rows: ColumnType[] }) {
    outputFileSync(
        `./logs/${getCurrentDate()}.jsonc`,
        `//[${getCurrentTime()}] ${tableName} \n${JSON.stringify(
            rows
        )}\n`,
        {
            flag: 'a',
            encoding: 'utf8',
        }
    );
}

function mapColumnTypeToRow({column_name: columnName, data_type: dataType}: ColumnType): TableRow {
    console.log({dataType, columnName})
    const foundTypeIndex = dataTypes.findIndex((o) =>
        o[2]!.includes(dataType)
    );

    if (foundTypeIndex === -1) {
        return {columnName, javaObj: '', rsObj: '', sqlType: []};
    }

    const foundDataType = dataTypes[foundTypeIndex];

    const javaObj = foundDataType[0]!;
    const rsObj = foundDataType[1]!;
    const sqlType = [...foundDataType[2]!];

    return {columnName, javaObj, rsObj, sqlType};
}