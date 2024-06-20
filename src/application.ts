/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  AuthenticationComponent,
  registerAuthenticationStrategy,
} from '@loopback/authentication';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {SecurityBindings, securityId} from '@loopback/security';
import {ServiceMixin} from '@loopback/service-proxy';
import {IConfig} from 'config';
import path from 'path';
import {
  COGNITO_USER_CONFIG_KEY,
  CognitoAdminUserService,
  CognitoUserAuthenticationStrategy,
  CognitoUserService,
  LooseCognitoUserAuthenticationStrategy,
} from './auth';
import {
  BricksellActiveRoleBinding,
  BricksellActiveRoleMiddleware,
} from './auth/role/middleware';
import config from './config';
import {MYSQL_CONFIG, MysqlDsDataSource} from './datasources';
import {JwtAuthSpecEnhancer} from './my-spec';
import {MySequence} from './sequence';

export {ApplicationConfig};

const getFromConfigObject = (configObj: object, pathInObj?: string): any => {
  if (!pathInObj || pathInObj.trim() === '') {
    return configObj;
  }

  const [start, ...end] = pathInObj.split('.');

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (typeof configObj[start] === 'undefined') {
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return getFromConfigObject(configObj[start], end.join('.'));
};

export class BricksellApiBasicApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  public config: IConfig;
  constructor(appConfig?: IConfig) {
    const finalConfigObj = appConfig ? appConfig : config.util.toObject();

    const options = getFromConfigObject(finalConfigObj, 'app');

    super(options);
    this.config = finalConfigObj;
    this.bind(BricksellActiveRoleBinding).toProvider(
      BricksellActiveRoleMiddleware,
    );

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(AuthenticationComponent);

    this.add(createBindingFromClass(JwtAuthSpecEnhancer));

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    this.installBindings();
    this.service(CognitoAdminUserService);
    this.service(CognitoUserService);
    registerAuthenticationStrategy(this, CognitoUserAuthenticationStrategy);
    registerAuthenticationStrategy(
      this,
      LooseCognitoUserAuthenticationStrategy,
    );

    this.dataSource(MysqlDsDataSource, 'mysqlDs');
    this.bind(MYSQL_CONFIG).to(
      getFromConfigObject(this.config, 'datasources.mysql'),
    );

    this.bind(SecurityBindings.USER).to({
      name: '',
      email: '',
      [securityId]: '',
    });
  }

  protected installBindings() {
    const services: any = getFromConfigObject(this.config, 'services');
    if ('cognitoUser' in services)
      this.bind(COGNITO_USER_CONFIG_KEY).to(
        getFromConfigObject(this.config, 'services.cognitoUser'),
      );
  }
}
