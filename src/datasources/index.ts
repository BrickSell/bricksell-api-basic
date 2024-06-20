import {MYSQL_DATASOURCE, MysqlDsDataSource} from './mysql-ds.datasource';

export * from './mysql-ds.datasource';

const selectedDatabase = 'MYSQL';
type SelectedDatabase = 'MYSQL';

export const DATASOURCES = {
  MSSQL: 'datasources.SQLServerDS',
  MYSQL: MYSQL_DATASOURCE
} as const;

export interface DATASOURCESINSTANCES {
  MYSQL: MysqlDsDataSource;
}

export const DefaultedDatasource = DATASOURCES[selectedDatabase];
export type DefaultedDatasourceType = DATASOURCESINSTANCES[SelectedDatabase];
