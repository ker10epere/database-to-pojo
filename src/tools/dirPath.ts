import { join } from 'path';

export enum DirectoryType {
  Repository = 'Repository',
  Service = 'Service',
  RepositoryImpl = 'RepositoryImpl',
  ServiceImpl = 'ServiceImpl',
  Logs = 'Logs',
}

export const generateDirOutputPath = (
  dirType: DirectoryType,
  fileName: string,
  modelName?: string
): string => {
  if (DirectoryType.Logs === dirType) {
    return join(__dirname, `../../outputs/logs/${fileName}`);
  }
  return join(__dirname, `../../outputs/${modelName}/${dirType}/${fileName}`);
};
