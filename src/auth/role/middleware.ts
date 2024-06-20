import {BindingKey, Getter, injectable, Provider} from '@loopback/core';
import {repository} from '@loopback/repository';
import {RequestContext} from '@loopback/rest';
import {SecurityBindings, securityId} from '@loopback/security';
import {UserRepository, UsersRolesRepository} from '../../repositories';

export const BricksellActiveRole = BindingKey.create('bricksell.active_role');
export const BricksellActiveRoleBinding = BindingKey.create(
  'bricksell.middleware.active_role',
);

@injectable()
export class BricksellActiveRoleMiddleware
  implements Provider<(request: RequestContext) => Promise<void>>
{
  constructor(
    @repository.getter(UserRepository)
    private userRepositoryGetter: Getter<UserRepository>,
    @repository.getter(UsersRolesRepository)
    private userRoleRepositoryGetter: Getter<UsersRolesRepository>,
  ) {}

  value() {
    return async (context: RequestContext) => {
      try {
        const currentUserProfile = await context.get(SecurityBindings.USER);

        const userRoleRepo = await this.userRoleRepositoryGetter();
        const userRepo = await this.userRepositoryGetter();

        const currentUser = (await userRepo.findOne({
          where: {cognitoToken: currentUserProfile[securityId]},
        }))!;
        if (!currentUser) {
          return;
        }

        const currentUserRoles = await userRoleRepo.find({
          where: {userId: currentUser.id},
        });

        const roleHeader = context.request.headers['x-bricksell-role'];

        const requestedRoleInUser = currentUserRoles
          .filter(role => role.roleStatus === 'AUTHORIZED')
          .find(role => role.roleId === roleHeader);

        if (!requestedRoleInUser) {
          context.bind(BricksellActiveRole.key).to(currentUser.mainRoleId);

          return;
        }

        context.bind(BricksellActiveRole.key).to(requestedRoleInUser.roleId);
      } catch (_err) {
        context.bind(BricksellActiveRole.key).to(undefined);
        /** non critical error */
      }
    };
  }
}
