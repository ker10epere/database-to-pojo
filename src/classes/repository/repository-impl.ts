import {TableRow} from '../../interfaces/database.interfaces';
import {deleteMultiple} from './delete-list';
import {create} from './insert';
import {list} from './list';
import {updateMultiple} from './update-multiple';
import {updateWithResult} from './update-with-result';

export const repositoryImpl = (tableRows: TableRow[]) => {
  const insertMethod = create(tableRows);
  const listMethod = list(tableRows);
  const updateWithResultMethod = updateWithResult(tableRows);
  const updateMultipleMethod = updateMultiple(tableRows);
  const deleteMultipleMethod = deleteMultiple();
  return `
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
};
