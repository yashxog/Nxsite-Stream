import { IPostJobData } from '@post/interfaces/post.interface';
import { BaseQueue } from '@services/queues/base.queue';
import { postWorker } from '@root/shared/workers/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('posts');
    this.processJob('addPostToDB', 5, postWorker.savePostToDB);
  }

  public addPostJob(name: string, data: IPostJobData): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
