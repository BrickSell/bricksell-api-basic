import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
} from '@loopback/repository';
import {DefaultedDatasource, DefaultedDatasourceType} from '../datasources';
import {
  User,
  UserPaymentStatus,
  UserPaymentStatusRelations,
  UserRole,
} from '../models';
import {UserRepository} from './users.repository';

export class UsersPaymentStatusRepository extends DefaultCrudRepository<
  UserPaymentStatus,
  typeof UserPaymentStatus.prototype.id,
  UserPaymentStatusRelations
> {
  public readonly user: BelongsToAccessor<
    User,
    typeof UserPaymentStatus.prototype.id
  >;

  constructor(
    @inject(DefaultedDatasource) dataSource: DefaultedDatasourceType,

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
  }
}
