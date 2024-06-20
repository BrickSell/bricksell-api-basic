import {
  AdminDeleteUserCommand,
  AdminDeleteUserCommandInput,
  AdminDeleteUserCommandOutput,
  AdminDisableUserCommand,
  AdminDisableUserCommandInput,
  AdminDisableUserCommandOutput,
  AdminEnableUserCommand,
  AdminEnableUserCommandInput,
  AdminEnableUserCommandOutput,
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  InitiateAuthCommandInput,
  InitiateAuthCommandOutput,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput,
  SignUpCommand,
  SignUpCommandInput,
  SignUpCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';
import {BindingScope, bind, inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import crypto from 'crypto';
import {Config} from '../cognito.interfaces';
import {COGNITO_USER_CONFIG_KEY} from './cognito-user.service';

@bind({scope: BindingScope.APPLICATION})
export class CognitoAdminUserService {
  private client: CognitoIdentityProviderClient;

  constructor(@inject(COGNITO_USER_CONFIG_KEY) private config: Config) {
    console.log('Cognito Auth Service using config: ', this.config);
    this.client = new CognitoIdentityProviderClient(this.config);
  }

  public async getUserAttributes(username: string): Promise<AdminGetUserCommandOutput> {
    const input: AdminGetUserCommandInput = {
      UserPoolId: this.config.userPoolId,
      Username: username
    };
    const command = new AdminGetUserCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async adminSignUpUser(
    phoneNumber: string,
    password: string,
    name: string,
    email: string
  ): Promise<SignUpCommandOutput> {
    const input: SignUpCommandInput = {
      ClientId: this.config.userPoolClientId,
      Username: phoneNumber,
      Password: password,
      SecretHash: this.getSecretHash(phoneNumber),
      UserAttributes: [
        {
          Name: 'name',
          Value: name
        },
        {
          Name: 'email',
          Value: email
        }
      ]
    };
    const command = new SignUpCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async getUsers(userPhone?: string, paginationToken?: string, limit = 15): Promise<ListUsersCommandOutput> {
    const input: ListUsersCommandInput = {
      UserPoolId: this.config.userPoolId,
      Limit: limit
    };
    if (userPhone) input.Filter = `phone_number ^= "${userPhone}"`;
    if (paginationToken) input.PaginationToken = paginationToken;
    const command = new ListUsersCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async enableUser(userName?: string): Promise<AdminEnableUserCommandOutput> {
    const input: AdminEnableUserCommandInput = {
      UserPoolId: this.config.userPoolId,
      Username: userName
    };

    const command = new AdminEnableUserCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async disableUser(userName?: string): Promise<AdminDisableUserCommandOutput> {
    const input: AdminDisableUserCommandInput = {
      UserPoolId: this.config.userPoolId,
      Username: userName
    };

    const command = new AdminDisableUserCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async deleteUser(userName?: string): Promise<AdminDeleteUserCommandOutput> {
    const input: AdminDeleteUserCommandInput = {
      UserPoolId: this.config.userPoolId,
      Username: userName
    };

    const command = new AdminDeleteUserCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  public async initiateAdminAuth(phoneNumber: string, password: string): Promise<InitiateAuthCommandOutput> {
    /**
     * Key difference from admin and user auth its the AuthFlow. For admins its USER_PASSWORD_AUTH and for user its CUSTOM_AUTH
     */
    const secretHash = this.getSecretHash(phoneNumber);
    const input: InitiateAuthCommandInput = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: this.config.userPoolClientId,
      AuthParameters: {
        USERNAME: phoneNumber,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    };

    const command = new InitiateAuthCommand(input);
    try {
      const response = await this.client.send(command);
      return response;
    } catch (error) {
      throw new HttpErrors[400](error.message);
    }
  }

  private getSecretHash(username: string): string {
    const secretKey = this.config.userPoolClientSecret;
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(`${username}${this.config.userPoolClientId}`);
    const hash = hmac.digest('base64');
    return hash;
  }
}
