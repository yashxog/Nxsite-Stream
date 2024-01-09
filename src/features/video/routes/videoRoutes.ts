import express, { Router } from 'express';
import { authMiddleware } from '@globals/helpers/auth-middleware';
import { Create } from '@video/controllers/create-video';
import { Delete } from '@video/controllers/delete-video';
import { Update } from '@video/controllers/update-video';
import { Get } from '@video/controllers/get-video';

class VideoRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/video/upload', authMiddleware.checkAuthentication, Create.prototype.uploadVideo);
    this.router.delete('/video/delete/:videoId', authMiddleware.checkAuthentication, Delete.prototype.deleteVideo);
    this.router.put('/video/update/:videoId', authMiddleware.checkAuthentication, Update.prototype.video);
    this.router.get('/video', authMiddleware.checkAuthentication, Get.prototype.randomVideos);
    this.router.get('/search/video', authMiddleware.checkAuthentication, Get.prototype.searchVideos);
    this.router.get('/video/tags', authMiddleware.checkAuthentication, Get.prototype.videosByTags);

    return this.router;
  }
}

export const videoRoutes: VideoRoutes = new VideoRoutes();
