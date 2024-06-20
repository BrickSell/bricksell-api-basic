import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DefaultedDatasource, DefaultedDatasourceType} from '../datasources';
import {Role, User, UserRole, UserRoleRelations} from '../models';
import {RoleRepository} from './roles.repository';
import {UserRepository} from './users.repository';

export class UsersRolesRepository extends DefaultCrudRepository<
  UserRole,
  typeof UserRole.prototype.id,
  UserRoleRelations
> {
  public readonly user: BelongsToAccessor<User, typeof UserRole.prototype.id>;
  public readonly role: BelongsToAccessor<Role, typeof UserRole.prototype.id>;

  constructor(
    @inject(DefaultedDatasource) dataSource: DefaultedDatasourceType,
    @repository.getter('RoleRepository')
    protected rolesRepositoryGetter?: Getter<RoleRepository>,
    @repository.getter('UserRepository')
    protected usersRepositoryGetter?: Getter<UserRepository>,
  ) {
    super(UserRole, dataSource);

    if (usersRepositoryGetter)
      this.user = this.createBelongsToAccessorFor(
        'user',
        usersRepositoryGetter,
      );
    if (this.user)
      this.registerInclusionResolver('user', this.user.inclusionResolver);

    if (rolesRepositoryGetter)
      this.role = this.createBelongsToAccessorFor(
        'role',
        rolesRepositoryGetter,
      );
    if (this.role)
      this.registerInclusionResolver('role', this.role.inclusionResolver);
  }
}
