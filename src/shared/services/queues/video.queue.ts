import { IVideoJobData } from '@video/interfaces/video.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { videoWorker } from '@root/shared/workers/video.worker';

class VideoQueue extends BaseQueue {
  constructor() {
    super('video');
    this.processJob('addVideoToDB', 5, videoWorker.saveVideoToDB);
    this.processJob('deleteVideoFromDB', 5, videoWorker.deleteVideoFromDB);
    this.processJob('updateVideoInDB', 5, videoWorker.updateVideoInDB);
  }

  public addVideoJob(name: string, data: IVideoJobData): void {
    this.addJob(name, data);
  }
}

export const videoQueue: VideoQueue = new VideoQueue();
