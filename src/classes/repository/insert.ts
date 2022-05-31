import {
  generateSBInsertQuery,
  generateSQLInsertQuery,
  getValuesAdd,
} from '../../tools/helpers';
import { TableRow } from '../database.interfaces';
generateSQLInsertQuery;

export const insert = (tableRows: TableRow[]): string => {
  const valuesAddTabSize = '        ';

  const sbInsertQuery = generateSBInsertQuery(tableRows);

  const columns = tableRows
    .filter(({ columnName }) => columnName !== 'id')
    .map(({ columnName }) => columnName);

  const valuesAdd = columns
    .map((columnName) => valuesAddTabSize + getValuesAdd(columnName))
    .join('\n');

  const template = `
    @Override
    public Integer insert(##CLASSNAME## item) throws ClassNotFoundException, SQLException,
            NamingException {
        debug(item);
        ${sbInsertQuery}

        final List<Object> values = new ArrayList<>();

${valuesAdd}

        try (Connection cn = getConnection()) {
            try (PreparedStatement ps = cn.prepareStatement(sb.toString())) {
                SetPreparedStatement.set(ps, values);
                sql(ps);
                final int i = ps.executeUpdate();

                debug("Insert Result = " + i);
                return i;
            } catch (Exception e) {
                e.printStackTrace();
                error(ThrowableUtils.stringify(e));
                throw e;
            }

        } catch (Exception e) {
            e.printStackTrace();
            error(ThrowableUtils.stringify(e));
            throw e;
        }
    }
`;
  return template;
};
