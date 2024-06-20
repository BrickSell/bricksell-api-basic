import {BricksellApiBasicApplication} from '../..';
import {createRestAppClient, Client} from '@loopback/testlab';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new BricksellApiBasicApplication();

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: BricksellApiBasicApplication;
  client: Client;
}
