import {bind, BindingScope, inject} from '@loopback/core';
import {FilterBuilder, repository, WhereBuilder} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {BricksellActiveRole} from '../auth/role/middleware';
import {RoleStatus, RoleType, User} from '../models';
import {
  RoleRepository,
  UserRepository,
  UsersRolesRepository,
} from '../repositories';

const emailPattern = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;

export const enum USERRELATIONS {
  USER_ROLES = 'userRoles',
}

@bind({scope: BindingScope.TRANSIENT})
export class UsersService {
  cognitoId: string;
  userId: string;

  public ADMIN_ROLE = 'ADMIN';
  public BROKER_ROLE = 'BROKER';
  public BUYER_ROLE = 'BUYER';
  public MASTERBROKER_ROLE = 'MASTERBROKER';
  public NOTARY_ROLE = 'NOTARY';
  public OWNER_ROLE = 'OWNER';
  public PARTNER_ROLE = 'PARTNER';
  public OPEN_ROLE = 'OPEN';

  constructor(
    @inject(SecurityBindings.USER) protected userProfile: UserProfile,
    @repository(UserRepository) public usersRepository: UserRepository,
    @inject(BricksellActiveRole.key, {optional: true}) public activeRole = '',
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(UsersRolesRepository)
    public userRoleRepository: UsersRolesRepository,
  ) {
    this.cognitoId = this.userProfile[securityId];
    this.userId = this.userProfile['userId'];
  }

  getUserId(): string {
    return this.userId;
  }

  objectToModel(user: User): User {
    // Verifica solo los items de el objeto y los convierte a undefined si estan vacios
    for (const key in user) {
      if (user[key as keyof typeof user] === '') {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        user[key] = undefined;
      }
    }

    return user;
  }

  async getById(
    userId: string,
    userRelations?: USERRELATIONS[],
  ): Promise<User> {
    if (!userRelations?.includes(USERRELATIONS.USER_ROLES))
      userRelations?.push(USERRELATIONS.USER_ROLES);

    const filter = new FilterBuilder<User>();

    const user = await this.usersRepository.findById(userId, filter.build());
    if (!user) throw new HttpErrors[404](`User ${userId} not found.`);

    return user;
  }

  async getUserByCognitoId(userRelations?: USERRELATIONS[]): Promise<User> {
    const where = new WhereBuilder<User>()
      .eq('cognitoToken', this.cognitoId)
      .build();
    const filter = new FilterBuilder<User>().where(where);
    if (userRelations) {
      for (const relation of userRelations) {
        filter.include(relation);
      }
    }
    const [user] = await this.usersRepository.find(filter.build());
    if (!user)
      throw new HttpErrors[400](
        `User with cognitoId ${this.cognitoId} not found.`,
      );

    return user;
  }

  getActiveRole() {
    return this.activeRole;
  }

  async userExists(userId: string): Promise<void> {
    const user = await this.usersRepository.exists(userId);
    if (!user) throw new HttpErrors[404](`User ${userId} not found.`);
  }

  isUserValid(user: User): boolean {
    if (user.mail && !emailPattern.test(user.mail)) return false;
    return true;
  }

  isValidMonth(month: number): boolean {
    return Number.isInteger(month) && month >= 0 && month <= 11;
  }

  isValidYear(year: number): boolean {
    return Number.isInteger(year) && year > 0;
  }

  async isUserFromSameOrganization(
    userId: string,
    organizationId: string,
  ): Promise<Boolean> {
    const user = await this.usersRepository.findById(userId);
    if (user.organizationParentId === organizationId) return true;

    return false;
  }

  getRandomIdentifier(): string {
    return new Date().getTime().toString().substring(7);
  }

  async createUniqueReferalCode(): Promise<string> {
    let codeExists = false;
    let newCode: string;
    do {
      const randomIdentifier: string = this.getRandomIdentifier();
      newCode = 'BSK-' + randomIdentifier;

      const where = new WhereBuilder<User>().eq('referalCode', newCode).build();
      const filter = new FilterBuilder<User>().where(where).build();
      const userWithCode = await this.usersRepository.find(filter);
      codeExists = userWithCode.length > 0;
      if (codeExists)
        console.log(
          `User with code ${newCode} found. Retrying for a new Code.`,
        );
    } while (codeExists);

    return newCode;
  }

  async isRoleValid(role: string): Promise<void> {
    const roles = await this.roleRepository.exists(role);
    if (!roles) throw new HttpErrors[404](`Role ${role} not found.`);
  }

  async deleteRole(userId: string, roleId: RoleType): Promise<User> {
    const userRoles = await this.userRoleRepository.findOne({
      where: {userId, roleId},
    });
    if (!userRoles)
      throw new HttpErrors[404](`User ${userId} does not have role ${roleId}.`);

    await this.userRoleRepository.updateById(userRoles.id, {
      roleStatus: RoleStatus.DELETED,
      deletedAt: new Date().toISOString(),
      deletedBy: this.userId,
      updatedAt: new Date().toISOString(),
      updatedBy: this.userId,
    });

    return this.getUserByCognitoId([USERRELATIONS.USER_ROLES]);
  }

  async updateRoleStatus(
    userId: string,
    roleId: RoleType,
    roleStatus: RoleStatus,
  ): Promise<User> {
    const userRoles = await this.userRoleRepository.findOne({
      where: {userId, roleId},
    });
    if (!userRoles)
      throw new HttpErrors[404](`User ${userId} does not have role ${roleId}.`);

    await this.userRoleRepository.updateById(userRoles.id, {
      roleStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: this.userId,
    });

    return this.getUserByCognitoId([USERRELATIONS.USER_ROLES]);
  }

  async createRole(roleId: string): Promise<void> {
    const user = await this.getUserByCognitoId([USERRELATIONS.USER_ROLES]);
    const userId = user.id;
    const userRoles = user.userRoles;

    const hasRole = userRoles?.some(ur => ur.roleId === roleId);
    const hasDeletedRole = userRoles?.some(
      ur => ur.roleId === roleId && ur.deletedAt,
    );

    if (hasDeletedRole) throw new HttpErrors[423]('Deleted role');

    if (!hasRole) {
      await this.usersRepository
        .userRoles(userId)
        .create({roleId, userId, createdBy: userId, updatedBy: userId});
    }
  }
}
