import {Entity, hasMany, model, property} from '@loopback/repository';
import {v4} from 'uuid';
import {UserRole} from './users-roles.model';

@model({settings: {idInjection: false}})
export class Role extends Entity {
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
    length: 50,
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @hasMany(() => UserRole)
  usersRoles: UserRole[];
}
export interface RoleRelations {
  usersRoles?: UserRole[];
}

export type RoleWithRelations = Role & RoleRelations;
