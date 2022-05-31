import { TableRow } from '../database.interfaces';
import { deleteMultiple } from './delete-list';
import { insert } from './insert';
import { list } from './list';
import { updateMultiple } from './update-multiple';
import { updateWithResult } from './update-with-result';

export const repositoryImpl = (tableRows: TableRow[]) => {
  const insertMethod = insert(tableRows);
  const listMethod = list(tableRows);
  const updateWithResultMethod = updateWithResult(tableRows);
  const updateMultipleMethod = updateMultiple(tableRows);
  const deleteMultipleMethod = deleteMultiple();
  const template = `
public class ##CLASSNAME##RepositoryImpl extends AbstractRepositoryImpl<##CLASSNAME##> implements ##CLASSNAME##Repository {

    public ##CLASSNAME##RepositoryImpl(String tableName, DatabaseManager dManager, Logger logger) {
        super(##CLASSNAME##.class, tableName, dManager, logger);
    }
${insertMethod}
${listMethod}
${updateWithResultMethod}
${updateMultipleMethod}
${deleteMultipleMethod}

}
    `;

  return template;
};
