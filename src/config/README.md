# Configuration

Our configuration is powered by [node-config](https://github.com/lorenwest/node-config) take a look at how it handle multiple configuration files to build a configuration object depending on the environment the app is running and various factors.

- Must read: [Configuration Files]((https://github.com/lorenwest/node-config/wiki/Configuration-Files))

- For reference: [Wiki](https://github.com/lorenwest/node-config/wiki)

## Files

### `default.ts`

Contains all default values. Ideally this file contains the whole strucure of our config file even with blank values. It has documented all properties we use. If you're modifying this please keep it that way. It's a fallback in case a required value is not provided by any other mean. It's the first to load which means any value here can be overwrritten by any other file.

### `<env>.ts`

Currently we have  `development`,`production` and `test`. This is the specific configuration that is different if the app is run in any of those environments.

### `custom-environment-variables.ts`

This contains the mapping for all our values to its corresponding environment variable. If the environment variable exist for a given value, it will overwrite it. It has higher priority than the files.

### `local.ts`

Not checked in on the repo on purpose. This is meant for local development only. Feel free to create one of your own as a replacement for a messy .env file.
