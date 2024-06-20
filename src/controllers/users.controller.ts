import {authenticate} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {
  DataObject,
  FilterBuilder,
  WhereBuilder,
  repository,
} from '@loopback/repository';
import {getModelSchemaRef, param, post, response} from '@loopback/rest';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {COGNITO_USER_AUTH_STRATEGY} from '../auth';
import {RoleType, User} from '../models';
import {UserRepository} from '../repositories';
import {UsersService} from '../services';

export class UserAuthController {
  cognitoId: string;
  cognitoPhone: string;

  constructor(
    @inject(SecurityBindings.USER) protected userProfile: UserProfile,
    @repository(UserRepository) public usersRepository: UserRepository,
    @service(UsersService) public usersService: UsersService,
  ) {
    this.cognitoId = userProfile[securityId];
    this.cognitoPhone = userProfile.userName;
  }

  @authenticate({strategy: COGNITO_USER_AUTH_STRATEGY})
  @post('/v1/users/register')
  @response(200, {
    description:
      'Create a user with a role. Default role is BUYER. Unexistant roles are defaulted as BUYER',
    content: {'application/json': {schema: getModelSchemaRef(User)}},
  })
  async userSignIn(
    @param.query.string('role', {
      default: 'BUYER',
      schema: {type: 'string', enum: Object.values(RoleType), default: 'BUYER'},
    })
    role = 'BUYER',
  ): Promise<User> {
    const where = new WhereBuilder<User>().eq('phone', this.cognitoPhone);
    const filter = new FilterBuilder<User>()
      .where(where.build())
      .include({relation: 'userRoles'});
    let [user] = await this.usersRepository.find(filter.build());

    if (!user) {
      const userBody: DataObject<User> = {
        phone: this.cognitoPhone,
        cognitoToken: this.cognitoId,
      };

      userBody.referalCode = await this.usersService.createUniqueReferalCode();

      user = await this.usersRepository.create(userBody);
    }
    await this.usersService.createRole(role);

    [user] = await this.usersRepository.find(filter.build());

    return user;
  }
}
