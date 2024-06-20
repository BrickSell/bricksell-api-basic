module.exports = {
  // Set by the env var NODE_ENV value. Informative/debugging config value.
  // It'll help you understand how the final config object resolved.
  env: '',

  // Config under 'app' key implements loopback's
  // ApplicationConfig interface. It's not well documented
  // on their current API reference.  Properties defined comes
  // from the original index.ts config object.
  app: {
    rest: {
      port: 3000,

      // The `gracePeriodForClose` provides a graceful close for http/https
      // servers with keep-alive clients. The default value is `Infinity`
      // (don't force-close). If you want to immediately destroy all sockets
      // upon stop, set its value to `0`.
      // See https://www.npmjs.com/package/stoppable
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },

    enableExplorer: true,
    version: 'v1',
  },
  services: {
    cognitoUser: {
      awsRegion: '',
      userPoolId: '',
      userPoolClientId: '',
    },
    incode: {
      baseUrl: '',
      apiKey: '',
    },
    twilio: {
      accountSid: '',
      authToken: '',
      messagingServiceSid: '',
    },
  },
  datasources: {
    mysql: {
      name: 'mysqlDs',
      connector: 'mysql',
    },
    redis: {
      datasource: 'redisDatasource',
      host: '',
      port: 0,
    },
  },
  clients: {},
};
