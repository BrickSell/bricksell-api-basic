module.exports = {
  env: 'development',
  app: {
    rest: {
      port: 3000,
    },
  },
  services: {
    cognitoUser: {
      awsRegion: 'us-east-1',
      userPoolId: 'us-east-1_c003RSErw',
      userPoolClientId: '3dmtinas623gc311d4na50uub7',
    },
  },
  clients: {},
  datasources: {},
};
