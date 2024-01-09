import { Job, DoneCallback } from 'bull';
import Logger from 'bunyan';
import { config } from '@root/config';
import { videoService } from '@services/db/video.service';

const log: Logger = config.createLogger('videoWorker');

class VideoWorker {
  async saveVideoToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await videoService.addVideoToDB(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async deleteVideoFromDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne } = job.data;
      await videoService.deleteVideo(keyOne);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }

  async updateVideoInDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value } = job.data;
      await videoService.editVideo(key, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const videoWorker: VideoWorker = new VideoWorker();
