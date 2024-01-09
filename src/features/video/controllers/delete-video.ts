import { Request, Response } from 'express';
import { VideoCache } from '@services/redis/video.cache';
import HTTP_STATUS from 'http-status-codes';
import { videoQueue } from '@services/queues/video.queue';
const videoCache: VideoCache = new VideoCache();

export class Delete {
  public async deleteVideo(req: Request, res: Response): Promise<void> {
    // socketIOVideoObject.emit('delete video', req.params.videoId);
    await videoCache.deleteVideoFromCache(req.params.videoId, `${req.currentUser!.userId}`);
    videoQueue.addVideoJob('deleteVideoFromDB', { keyOne: req.params.videoId, keyTwo: req.currentUser!.userId });
    res.status(HTTP_STATUS.OK).json({ message: 'video deleted successfully' });
  }
}
