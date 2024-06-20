import {Entity, hasMany, model, property} from '@loopback/repository';
import {v4} from 'uuid';
import {UserRole} from './users-roles.model';

@model({
  name: 'User',
  settings: {
    idInjection: false,
  },
})
export class User extends Entity {
  @property({
    type: 'string',
    required: true,
    length: 37,
    id: true,
    default: () => v4(),
  })
  id: string;

  @property({
    type: 'string',
    length: 60,
    jsonSchema: {
      pattern: '^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,4}$',
      minLength: 5,
      maxLength: 60,
    },
  })
  mail: string;

  @property({
    type: 'string',
    length: 100,
  })
  name?: string;

  @property({
    type: 'string',
    length: 20,
    required: true,
  })
  phone: string;

  @property({
    type: 'date',
  })
  birthDate?: string;

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

  @property({
    type: 'string',
    length: 37,
  })
  createdBy?: string;

  @property({
    type: 'string',
    length: 37,
  })
  updatedBy?: string;

  @property({
    type: 'string',
    length: 37,
  })
  deletedBy?: string;

  @property({
    type: 'string',
    length: 255,
    mysql: {
      dataType: 'varchar',
      dataLength: 255,
    },
  })
  picture?: string;

  @property({
    type: 'string',
    length: 255,
    mysql: {
      dataType: 'varchar',
      dataLength: 255,
    },
  })
  taxId?: string;

  @property({
    type: 'boolean',
    default: true,
  })
  isActive?: boolean;

  @property({
    type: 'string',
    length: 37,
  })
  organizationParentId?: string;

  @property({
    type: 'string',
    length: 37,
  })
  invitedFromId?: string;

  @property({
    type: 'string',
    length: 50,
  })
  userName?: string;

  @property({
    type: 'string',
    length: 250,
  })
  cognitoToken?: string;

  @property({
    type: 'boolean',
    default: 1,
  })
  isAdmin?: boolean;

  @property({
    type: 'string',
    length: 37,
    default: () => 'Buyer',
  })
  mainRoleId?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  isVerified?: boolean;

  @property({
    type: 'string',
    length: 12,
  })
  referalCode?: string;

  @property({
    type: 'string',
    length: 37,
    required: true,
    default: () => 'CREATED',
  })
  status: string;

  @property({
    type: 'string',
    length: 36,
  })
  interviewId?: string;

  @hasMany(() => UserRole, {keyTo: 'userId'})
  userRoles: UserRole[];
  // Define well-known properties here

  // Indexer property to allow additional data

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here

  userRoles?: UserRole[];
}

export type UserWithRelations = User & UserRelations;
