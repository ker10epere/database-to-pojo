import {generateSBDeleteQuery, generateSQLInsertQuery, getValuesAdd,} from '../../tools/helpers';

generateSQLInsertQuery;

export const deleteMultiple = (): string => {
  const valuesAddTabSize = '                ';

  const valuesAddId = valuesAddTabSize + getValuesAdd('id');

  const sbDeleteQuery = generateSBDeleteQuery();

  return `
    @Override
    public void delete(List<##CLASSNAME##> items) throws ClassNotFoundException, SQLException, NamingException {
        debug(items);
        ${sbDeleteQuery}

        try (Connection cn = getConnection();) {
            cn.setAutoCommit(false);
            try (PreparedStatement ps = cn.prepareStatement(sb.toString())) {
                for (##CLASSNAME## item : items) {
                    final List<Object> values = new ArrayList<>();
    
    ${valuesAddId}
    
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
            cn.commit();
            cn.setAutoCommit(true);
        }
    }
`;
};
