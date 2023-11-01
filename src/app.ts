import express, { Express } from 'express';
import { NxsiteServer } from './setupServer';
import databaseConnection from './setupDatabase';
import { config } from './config';


class Application {
    public initialize(): void {

        this.loadConfig();
        databaseConnection();
        const app: Express = express();
        const server: NxsiteServer = new NxsiteServer(app);
        server.start();
    }

    private loadConfig(): void {
        config.validateConfig();
    }
}{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "plugins": [
    "@typescript-eslint"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parserOptions":  {
    "ecmaVersion":  2020,  // Allows for the parsing of modern ECMAScript features
    "sourceType":  "module"  // Allows for the use of imports
  },
  "rules": {
    "semi": [2, "always"],
    "space-before-function-paren": [0, {"anonymous": "always", "named": "always"}],
    "camelcase": 0,
    "no-return-assign": 0,
    "quotes": ["error", "single"],
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off"
  }
}


const application: Application = new Application();
application.initialize();
