import {BricksellApiBasicApplication} from './application';

export * from './application';

export async function main() {
  const app = new BricksellApiBasicApplication();
  await app.boot();
  await app.start();
  const url = app.restServer.url;
  console.log(`🟢 ~ Server is running at ${url}`);
  console.log(app.config);

  return app;
}

if (require.main === module) {
  // Run the application
  // config is now under src/config and instantiated in application.ts
  main().catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}
