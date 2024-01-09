import { authRoutes } from '@auth/routes/authRoutes';
import { Application } from 'express';
import { serverAdapter } from '@services/queues/base.queue';
import { currentUserRoutes } from '@auth/routes/currentRoutes';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { postRoutes } from '@post/routes/postRoutes';
import { videoRoutes } from '@video/routes/videoRoutes';

const BASE_PATH = '/api/v1';

export default (app: Application) => {
  const routes = () => {
    app.use('/queues', serverAdapter.getRouter());
    app.use(BASE_PATH, authRoutes.routes());
    app.use(BASE_PATH, authRoutes.signOutRoute());

    app.use(BASE_PATH, authMiddleware.verifyUser, currentUserRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, postRoutes.routes());
    app.use(BASE_PATH, authMiddleware.verifyUser, videoRoutes.routes());
  };
  routes();
};
