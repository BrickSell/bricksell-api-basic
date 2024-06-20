import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DefaultedDatasource, DefaultedDatasourceType} from '../datasources';
import {Role, RoleRelations} from '../models';

export class RoleRepository extends DefaultCrudRepository<
  Role,
  typeof Role.prototype.id,
  RoleRelations
> {
  constructor(
    @inject(DefaultedDatasource) dataSource: DefaultedDatasourceType,
  ) {
    super(Role, dataSource);
  }
}
