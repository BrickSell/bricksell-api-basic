/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly userName: string;
  readonly clientId: string;
  readonly sub: string;
  readonly isValid: boolean;
  readonly error?: any;
}

export interface Config {
  awsRegion: string;
  userPoolId: string;
  userPoolClientId: string;
  userPoolClientSecret: string;
}

export interface Credentials {
  jwt: string;
}

export interface RequiredUserAttributes {}
