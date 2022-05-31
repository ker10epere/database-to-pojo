import {
  generateSBDeleteQuery,
  generateSQLInsertQuery,
  getValuesAdd,
} from '../../tools/helpers';
generateSQLInsertQuery;

export const deleteMultiple = (): string => {
  const valuesAddTabSize = '                ';

  const valuesAddId = valuesAddTabSize + getValuesAdd('id');

  const sbDeleteQuery = generateSBDeleteQuery();

  const template = `
    @Override
    public void delete(List<##CLASSNAME##> items) throws ClassNotFoundException, SQLException, NamingException {
        debug(items);
        ${sbDeleteQuery}

        Connection cn = null;
        PreparedStatement ps = null;

        try {
            cn = getConnection();
            cn.setAutoCommit(false);
            ps = cn.prepareStatement(sb.toString());

            for (##CLASSNAME## item : items) {
                final List<Object> values = new ArrayList<>();

                // order is important
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
