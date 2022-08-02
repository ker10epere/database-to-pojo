import {generateSBUpdateQuery, generateSQLInsertQuery, getValuesAdd,} from '../../tools/helpers';
import {TableRow} from '../../interfaces/database.interfaces';

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

  return `
    @Override
    public void update(List<##CLASSNAME##> items) throws ClassNotFoundException, SQLException, NamingException {
        debug(items);
        ${sbUpdateQuery}

        try (Connection cn = getConnection(); ){
            cn.setAutoCommit(false);
            try(PreparedStatement ps = cn.prepareStatement(sb.toString());) {
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
            } catch (SQLException e) {
                cn.rollback();
                throw e;
            }
            cn.setAutoCommit(true);
            cn.commit();

        } 
    }
`;
};
