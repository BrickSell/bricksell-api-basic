module.exports = {
  env: 'NODE_ENV',
  app: {
    rest: {
      host: 'HOST',
      port: 'PORT',
      version: 'API_VERSION',
    },
  },
  services: {
    cognitoUser: {
      awsRegion: 'AWS_REGION',
      userPoolId: 'COGNITO_POOL_ID',
      userPoolClientId: 'COGNITO_POOL_CLIENT_ID',
      userPoolClientSecret: 'COGNITO_POOL_CLIENT_SECRET',
    },
    awsUsers: {
      cognito: {
        accessKey: 'AWS_ACCESS_KEY_ID',
        accessSecret: 'AWS_SECRET_ACCESS_KEY',
      },
    },
    incode: {
      baseUrl: 'INCODE_BASE_URL',
      apiKey: 'INCODE_API_KEY',
    },
    twilio: {
      accountSid: 'TWILIO_ACCOUNT_SID',
      authToken: 'TWILIO_AUTH_TOKEN',
      messagingServiceSid: 'TWILIO_MESSAGING_SERVICE_SID',
    },
  },
  datasources: {
    mysql: {
      name: 'MYSQL_NAME',
      connector: 'MYSQL_CONNECTOR',
      host: 'MYSQL_HOST',
      user: 'MYSQL_USER',
      password: 'MYSQL_PASSWORD',
      database: 'MYSQL_DATABASE',
    },
    redis: {
      name: 'REDIS_DATASOURCE',
      host: 'REDIS_HOST',
      port: 'REDIS_PORT',
    },
  },

  clients: {},
};
