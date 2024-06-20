// Used in integration tests.
module.exports = {
  // Empty values (undefined, '') will be ignored by the helper.
  env: 'test',
  app: {
    rest: {
      port: 4000,
      host: 'localhost',
    },
  },
  datasources: {},
};
