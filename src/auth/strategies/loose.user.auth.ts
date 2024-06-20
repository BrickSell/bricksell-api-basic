import {Request} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {CognitoUserAuthenticationStrategy} from './cognito.user.auth';

export const LOOSE_COGNITO_AUTH_STRATEGY = 'loose-cognito';
export const EMTPY_USER_PROFILE: UserProfile = {[securityId]: '', token: null};

/**
 * Performs CognitoAuthenticationStrategy but doesn't deny entry to endpoint
 * if user is not found. This is particularly useful for open endpoints that
 * need user information if available, for example the menu endpoint GET /products
 */
export class LooseCognitoUserAuthenticationStrategy extends CognitoUserAuthenticationStrategy {
  name: string = LOOSE_COGNITO_AUTH_STRATEGY;

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    try {
      const credentials = this.extractCredentials(request);
      const user = await this.verifyCredentials(credentials);
      return user;
    } catch (error) {
      console.log('Using empty user profile. Loose auth failed.');
      return EMTPY_USER_PROFILE;
    }
  }
}
