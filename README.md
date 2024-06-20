# bricksell-api-basic

This application is generated using [LoopBack 4 CLI](https://loopback.io/doc/en/lb4/Command-line-interface.html) with the
[initial project layout](https://loopback.io/doc/en/lb4/Loopback-application-layout.html).

## First time setup

### Creating the Database

Before running the project, it's essential to set up the database. We've provided a script that automates this process and prepares the necessary environment.

**Required Database Engine:** MySQL

The script has versions tailored for different operating systems:

- For macOS and Linux: `db-scripts/create-db.sh`
- For Windows: `db-scripts/create-db.ps1`

To execute on Windows, follow these instructions:

1. Open PowerShell.
2. Navigate to the project directory.
3. Run the following command:
   ```powershell
   .\db-scripts\create-db.ps1
   ```

To execute on macOS or Linux, follow these instructions:

1. Open Terminal.
2. Navigate to the project directory.
3. Run the following command:
   ```sh
   bash ./db-scripts/create-db.sh
   ```

### Setting up the Environments

In the `/configs` folder, you'll find environment configuration files. To run the project locally, create a file named `local.ts`. Here's an example configuration:

```typescript
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
  },

  clients: {},
};
```

This configuration should be adjusted with your specific environment variables before running the project.

<!-- italic -->

_Note: Please feel free to ask about how to create the configuration file and what information needs to be added to it._

### Install dependencies

By default, dependencies were installed when this application was generated.
Whenever dependencies in `package.json` are changed, run the following command:

```sh
npm install
```

To only install resolved dependencies in `package-lock.json`:

```sh
npm ci
```

### Run the application

```sh
npm start
```

You can also run `node .` to skip the build step.

Open http://127.0.0.1:3000 in your browser.

### Rebuild the project

To incrementally build the project:

```sh
npm run build
```

To force a full build by cleaning up cached artifacts:

```sh
npm run rebuild
```

### Fix code style and formatting issues

```sh
npm run lint
```

To automatically fix such issues:

```sh
npm run lint:fix
```
