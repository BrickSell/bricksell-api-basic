import {belongsTo, Entity, model, property} from '@loopback/repository';
import {v4} from 'uuid';
import {User} from './users.model';

@model({
  name: 'User',
  settings: {
    idInjection: false,
  },
})
export class UserPaymentStatus extends Entity {
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

  @property({
    type: 'string',
    length: 100,
  })
  stripeId?: string;

  @property({
    type: 'string',
    length: 50,
  })
  paymentStatus?: string;

  constructor(data?: Partial<UserPaymentStatus>) {
    super(data);
  }
}

export interface UserPaymentStatusRelations {
  // describe navigational properties here
}

export type UserPaymentStatusWithRelations = UserPaymentStatus &
  UserPaymentStatusRelations;
