import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile, securityId} from '@loopback/security';
import {User} from '../../models';
import {UserRepository} from '../../repositories';
import {ClaimVerifyResult, Config, Credentials} from '../cognito.interfaces';
import {
  COGNITO_USER_CONFIG_KEY,
  CognitoUserService,
} from '../users/cognito-user.service';

export const COGNITO_USER_AUTH_STRATEGY = 'cognito-user';

export class CognitoUserAuthenticationStrategy
  implements AuthenticationStrategy
{
  name: string = COGNITO_USER_AUTH_STRATEGY;
  cognitoService: CognitoUserService;

  constructor(
    @inject(COGNITO_USER_CONFIG_KEY) private config: Config,
    @repository(UserRepository) public userRepository: UserRepository, // @service(CognitoUserService) public cognitoUserService: CognitoUserService
  ) {
    // console.log('CognitoAuthenticationStrategy usando configuracion', this.config);
    // Hola dios, soy yo de nuevo... Se hizo asi por que al hacer el bind desde la aplicacion, no identificadaba el contexto correcto
    this.cognitoService = new CognitoUserService(this.config);
  }

  async authenticate(request: Request): Promise<UserProfile | undefined> {
    try {
      const credentials = this.extractCredentials(request);
      const user = await this.verifyCredentials(credentials);
      return user;
    } catch (error) {
      console.log(error);
      return undefined;
    }
  }

  async verifyCredentials(credentials: Credentials): Promise<UserProfile> {
    const claim = await this.cognitoService.verifyJWT(credentials.jwt);
    const user = await this.userRepository.findOne({
      where: {cognitoToken: claim.sub},
      fields: ['id', 'name', 'phone', 'deletedAt'],
    });
    if (user?.deletedAt) throw new HttpErrors.Unauthorized(`Deleted User.`);
    return this.userToUserProfile(claim, credentials.jwt, user);
  }

  private userToUserProfile(
    claim: ClaimVerifyResult,
    jwt: string,
    user?: User | null,
  ): UserProfile {
    const userProfile: UserProfile = {
      [securityId]: claim.sub,
      token: jwt,
      userName: claim.userName,
    };
    if (user) {
      userProfile.userId = user.id;
      userProfile.name = user.name;
      userProfile.phone = user.phone;
    }
    return userProfile;
  }

  extractCredentials(request: Request): Credentials {
    // For example.
    // Authorization : Bearer Z2l6bW9AZ21haWwuY29tOnBhc3N3b3Jk
    const authHeaderValue = request.get('Authorization');
    if (!authHeaderValue) {
      throw new HttpErrors.Unauthorized(`Authorization header not found.`);
    }

    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized(
        `Authorization header is not of type 'Bearer'.`,
      );
    }

    //split the string into 2 parts. We are interested in the base64 portion
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2)
      throw new HttpErrors.Unauthorized(
        `Authorization header value has too many parts. It must follow the pattern: 'Bearer xxyyzz' where xxyyzz is a base64 string.`,
      );
    const jwt = parts[1];
    return {jwt};
  }
}
