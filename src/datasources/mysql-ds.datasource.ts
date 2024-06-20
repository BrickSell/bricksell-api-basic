import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

export const MYSQL_CONFIG = 'datasources.config.mysql';
export const MYSQL_DATASOURCE_NAME = 'mysqlDs';
export const MYSQL_DATASOURCE = 'datasources.mysqlDs';

const config = {
  name: MYSQL_DATASOURCE_NAME,
  connector: 'mysql',
  host: process.env.MYSQL_HOST ?? '127.0.0.1',
  port: process.env.MYSQL_PORT ?? 3306,
  user: process.env.MYSQL_USER ?? 'aszyh',
  password: process.env.MYSQL_PASSWORD ?? 'Casiomarlin97',
  database: process.env.MYSQL_DATABASE ?? 'bricksell'
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class MysqlDsDataSource extends juggler.DataSource implements LifeCycleObserver {
  static dataSourceName = MYSQL_DATASOURCE_NAME;
  static readonly defaultConfig = config;

  constructor(
    @inject(MYSQL_CONFIG, {optional: true})
    dsConfig: object = config
  ) {
    super(dsConfig);
  }
}
