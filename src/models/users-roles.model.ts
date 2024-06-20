import {Entity, belongsTo, model, property} from '@loopback/repository';
import {v4} from 'uuid';
import {RoleStatus} from './enums';
import {Role, RoleWithRelations} from './roles.model';
import {User, UserWithRelations} from './users.model';

@model({
  settings: {
    idInjection: false,
    foreignKeys: {
      FkUserRoleRole: {
        name: 'FKUsersRolesRoles',
        entity: 'roleId',
        entityKey: 'id',
        foreignKey: 'FKUsersRolesRoles',
      },
      FkUserRoleUsers: {
        name: 'FKUserRolesUsers',
        entity: 'userId',
        entityKey: 'id',
        foreignKey: 'FKUserRolesUsers',
      },
    },
  },
})
export class UserRole extends Entity {
  @property({
    type: 'string',
    required: true,
    length: 37,
    id: true,
    default: () => v4(),
  })
  id: string;

  @belongsTo(() => User, {name: 'user'})
  userId: string;

  @belongsTo(() => Role, {name: 'role'})
  roleId: string;

  @property({
    type: 'string',
    required: true,
    length: 37,
    jsonSchema: {
      enum: Object.values(RoleStatus),
    },
    default: RoleStatus.CREATED,
  })
  roleStatus: RoleStatus;

  @property({
    type: 'date',
    default: () => new Date(),
  })
  createdAt?: string;

  @property({
    type: 'date',
  })
  updatedAt?: string;

  @property({
    type: 'date',
  })
  deletedAt?: string;

  // Define well-known properties here

  // Indexer property to allow additional data

  constructor(data?: Partial<UserRole>) {
    super(data);
  }
}
export interface UserRoleRelations {
  user?: UserWithRelations;
  role?: RoleWithRelations;
}

export type UserRoleWithRelations = UserRole & UserRoleRelations;
