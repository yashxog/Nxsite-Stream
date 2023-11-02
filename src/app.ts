import express, { Express } from 'express';
import { NxsiteServer } from '@root/setupServer';
import databaseConnection from '@root/setupDatabase';
import { config } from '@root/config';


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
        config.cloudinaryConfig();
    }
}


const application: Application = new Application();
application.initialize();
