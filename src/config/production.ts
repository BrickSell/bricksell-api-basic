module.exports = {
  env: 'production',
  app: {
    rest: {
      // We need a SSL certificate for this to work.
      // We'll get there.
      port: 3000,
    },
    enableExplorer: false,
  },
  services: {},
  datasources: {},
};
