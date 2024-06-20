import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DefaultedDatasource, DefaultedDatasourceType} from '../datasources';
import {User, UserRelations, UserRole} from '../models';
import {UsersRolesRepository} from './users-roles.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  public readonly userRoles: HasManyRepositoryFactory<
    UserRole,
    typeof User.prototype.id
  >;

  constructor(
    @inject(DefaultedDatasource) dataSource: DefaultedDatasourceType,
    @repository.getter(UsersRolesRepository)
    protected usersRoleRepositoryGetter?: Getter<UsersRolesRepository>,
  ) {
    super(User, dataSource);

    if (usersRoleRepositoryGetter)
      this.userRoles = this.createHasManyRepositoryFactoryFor(
        'userRoles',
        usersRoleRepositoryGetter,
      );
    if (this.userRoles)
      this.registerInclusionResolver(
        'userRoles',
        this.userRoles.inclusionResolver,
      );
  }
}
