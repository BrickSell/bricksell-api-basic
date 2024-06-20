/* eslint-disable @typescript-eslint/naming-convention */
import {bind, BindingScope, inject} from '@loopback/core';
import * as Axios from 'axios';
import * as jsonwebtoken from 'jsonwebtoken';
import {ClaimVerifyResult, Config} from '../cognito.interfaces';
const jwkToPem = require('jwk-to-pem');

interface TokenHeader {
  kid: string;
  alg: string;
}

interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}
interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Customer {
  UserAttributes: CognitoAttributes[];
  Username: string;
}

interface CognitoAttributes {
  Name: string;
  Value: string;
}

interface Claim {
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
  sub: string;
}

export const COGNITO_USER_CONFIG_KEY = 'services.cognito.user.config';

@bind({scope: BindingScope.APPLICATION})
export class CognitoUserService {
  private cacheKeys: MapOfKidToPublicKey | undefined;
  private cognitoIssuer: string;

  constructor(@inject(COGNITO_USER_CONFIG_KEY) private config: Config) {
    // console.log('Cognito Service using config: ', config);
    this.cognitoIssuer = `https://cognito-idp.${this.config.awsRegion}.amazonaws.com/${this.config.userPoolId}`;
  }

  private async getPublicKeys(): Promise<MapOfKidToPublicKey> {
    if (this.cacheKeys) return this.cacheKeys;

    const url = `${this.cognitoIssuer}/.well-known/jwks.json`;
    console.log(`Extracting public JSON Web Key from: ${this.cognitoIssuer}`);
    const publicKeys = await Axios.default.get<PublicKeys>(url);
    this.cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = {instance: current, pem};
      return agg;
    }, {} as MapOfKidToPublicKey);
    return this.cacheKeys;
  }

  public async getCustomer(AccessToken: string): Promise<Customer> {
    /**
     * Obtain user attributes from user pool
     * Reference: https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_GetUser.html
     */
    const cognitoAttributes = await Axios.default.post<Customer>(
      this.cognitoIssuer,
      {AccessToken},
      {
        headers: {
          'Content-Type': 'application/x-amz-json-1.1',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.GetUser'
        }
      }
    );

    return cognitoAttributes.data;
  }

  async verifyJWT(token: string): Promise<ClaimVerifyResult> {
    const tokenSections = (token || '').split('.');
    if (tokenSections.length < 2) {
      throw new Error('requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON) as TokenHeader;
    const keys = await this.getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
      throw new Error('claim made for unknown kid');
    }
    // const claim = (await verifyPromised(token, key.pem)) as unknown as Claim;
    const claim = jsonwebtoken.verify(token, key.pem) as Claim;

    const currentSeconds = Math.floor(new Date().valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
      throw new Error('claim is expired or invalid');
    }
    if (claim.iss !== this.cognitoIssuer) {
      throw new Error('claim issuer is invalid');
    }
    if (claim.token_use !== 'access') {
      throw new Error('claim use is not access');
    }

    const customer = await this.getCustomer(token);
    const phone = customer.UserAttributes.find(att => att.Name === 'phone_number');
    console.log('phone', phone);
    return {userName: phone?.Value ?? claim.username, clientId: claim.client_id, sub: claim.sub, isValid: true};
  }
}
