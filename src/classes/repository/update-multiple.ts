import {
  generateSBUpdateQuery,
  generateSQLInsertQuery,
  getValuesAdd,
} from '../../tools/helpers';
import { TableRow } from '../database.interfaces';
generateSQLInsertQuery;

export const updateMultiple = (tableRows: TableRow[]): string => {
  const valuesAddTabSize = '                ';

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
    public void update(List<##CLASSNAME##> items) throws ClassNotFoundException, SQLException, NamingException {
        debug(items);
        ${sbUpdateQuery}

        Connection cn = null;
        PreparedStatement ps = null;

        try {
            cn = getConnection();
            cn.setAutoCommit(false);
            ps = cn.prepareStatement(sb.toString());

            for (##CLASSNAME## item : items) {
                final List<Object> values = new ArrayList<>();

                // order is important
${valuesAdd}

                SetPreparedStatement.set(ps, values);
                sql(ps);
                ps.addBatch();
            }

            int[] results = ps.executeBatch();

            String joinedResult = IntStream.of(results)
                    .mapToObj(String::valueOf)
                    .collect(Collectors.joining("' "));
            debug("Result [ " + joinedResult + " ]");
        } catch (ClassNotFoundException | SQLException | NamingException e) {
            if (cn != null) cn.rollback();
            error(ThrowableUtils.stringify(e));
            throw e;
        } catch (Throwable e) {
            if (cn != null) cn.rollback();
            error(ThrowableUtils.stringify(e));
            throw ThrowableUtils.errorInstance(e);
        } finally {
            close(cn, ps);
        }
    }
`;
  return template;
};
