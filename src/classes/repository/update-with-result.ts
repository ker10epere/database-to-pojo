import {
  generateSBUpdateQuery,
  generateSQLInsertQuery,
  getValuesAdd,
} from '../../tools/helpers';
import { TableRow } from '../database.interfaces';
generateSQLInsertQuery;

export const updateWithResult = (tableRows: TableRow[]): string => {
  const valuesAddTabSize = '        ';

  const sbUpdateQuery = generateSBUpdateQuery(tableRows);

  const columns = tableRows
    .filter(({ columnName }) => columnName !== 'id')
    .map(({ columnName }) => columnName);
  // add id at the end
  columns.push('id');

  const valuesAdd = columns
    .map((columnName) => valuesAddTabSize + getValuesAdd(columnName))
    .join('\n');

  const template = `
    @Override
    public Integer updateWithResult(##CLASSNAME## item) throws ClassNotFoundException, SQLException,
            NamingException {
        debug(item);
        ${sbUpdateQuery}

        final List<Object> values = new ArrayList<>();

${valuesAdd}

        try (Connection cn = getConnection()) {
            try (PreparedStatement ps = cn.prepareStatement(sb.toString())) {
                SetPreparedStatement.set(ps, values);
                sql(ps);
                final int i = ps.executeUpdate();

                debug("Update Result = " + i);
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
