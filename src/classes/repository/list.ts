import {
  generateGetResultSetObjects,
  generateJavaPropertyNames,
  generateSBListQuery,
  generateSQLInsertQuery,
  getFindListConsumers,
} from '../../tools/helpers';
import { TableRow } from '../database.interfaces';
generateSQLInsertQuery;

export const list = (tableRows: TableRow[]): string => {
  const findListTabSize = '        ';
  const resultSetObjectsTabSize = '                        ';

  const sbListQuery = generateSBListQuery(tableRows);

  const javaPropertyNames = generateJavaPropertyNames(tableRows).join(', ');

  const findListConsumers = getFindListConsumers(tableRows)
    .map((o) => findListTabSize + o)
    .join('\n');

  const getResultSetObjects = generateGetResultSetObjects(tableRows)
    .map((o) => resultSetObjectsTabSize + o)
    .join('\n');

  const template = `
    @Override
    public Collection<##CLASSNAME##> list(##CLASSNAME## item) throws ClassNotFoundException,
            SQLException, NamingException {
        debug(item);
        ${sbListQuery}
        final List<Object> values = new ArrayList<>();
        final List<##CLASSNAME##> list = new ArrayList<>();

${findListConsumers}

        try (Connection cn = getConnection()) {
            try (PreparedStatement ps = cn.prepareStatement(sb.toString())) {
                SetPreparedStatement.set(ps, values);
                sql(ps);

                try (final ResultSet rs = ps.executeQuery()) {
                    while (rs.next()) {
${getResultSetObjects}

                        final ##CLASSNAME## obj = new ##CLASSNAME##(
                            ${javaPropertyNames}
                        );
                        list.add(obj);
                    }
                    debug("List Size = " + list.size());
                }

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

        return list;
    }

`;
  return template;
};
