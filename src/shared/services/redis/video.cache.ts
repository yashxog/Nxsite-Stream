import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@globals/helpers/error-handler';
import { ISaveVideoToCache, IVideoDocument } from '@video/interfaces/video.interface';
import { Helpers } from '@globals/helpers/helpers';
import { RedisCommandRawReply } from '@redis/client/dist/lib/commands';
// import { IReactions } from '@reaction/interfaces/reaction.interface';

const log: Logger = config.createLogger('videoCache');

export type VideoCacheMultiType = string | number | Buffer | RedisCommandRawReply[] | IVideoDocument | IVideoDocument[];

export class VideoCache extends BaseCache {
  constructor() {
    super('videoCache');
  }

  public async saveVideoToCache(data: ISaveVideoToCache): Promise<void> {
    const { key, currentUserId, uId, createdVideo } = data;
    const {
      _id,
      userId,
      username,
      videoVersion,
      videoId,
      title,
      description,
      thumbnailVersion,
      thumbnailId,
      isDeleted,
      linkedVideos,
      tags,
      categories,
      videoCopy,
      commentsCount,
      view,
      watchTime,
      dislike,
      like,
      privacy,
      reactions,
      createdAt,
      updatedAt
    } = createdVideo;

    const dataToSave = {
      _id: `${_id}`,
      userId: `${userId}`,
      username: `${username}`,
      videoVersion: `${videoVersion}`,
      videoId: `${videoId}`,
      title: `${title}`,
      description: `${description}`,
      thumbnailVersion: `${thumbnailVersion}`,
      thumbnailId: `${thumbnailId}`,
      isDeleted: `${isDeleted}`,
      linkedVideos: `${linkedVideos}`,
      tags: `${tags}`,
      categories: `${categories}`,
      videoCopy: `${videoCopy}`,
      commentsCount: `${commentsCount}`,
      view: `${view}`,
      watchTime: `${watchTime}`,
      dislike: `${dislike}`,
      like: `${like}`,
      privacy: `${privacy}`,
      reactions: `${reactions}`,
      createdAt: `${createdAt}`,
      updatedAt: `${updatedAt}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const videoCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'videoPostsCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      await this.client.ZADD('video', { score: parseInt(uId, 10), value: `${key}` });
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        multi.HSET(`video:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const count: number = parseInt(videoCount[0], 10) + 1;
      multi.HSET(`users:${currentUserId}`, 'videoPostsCount', count);
      multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getVideosFromCache(key: string, start: number, end: number): Promise<IVideoDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reply: string[] = await this.client.ZRANGE(key, start, end, { REV: true });
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      for (const value of reply) {
        multi.HGETALL(`video:${value}`);
      }
      const replies: VideoCacheMultiType = (await multi.exec()) as VideoCacheMultiType;
      const videoReplies: IVideoDocument[] = [];
      for (const video of replies as IVideoDocument[]) {
        video.commentsCount = Helpers.parseJson(`${video.commentsCount}`) as number;
        // video.reactions = Helpers.parseJson(`${video.reactions}`) as IReactions;
        video.createdAt = new Date(Helpers.parseJson(`${video.createdAt}`)) as Date;
        videoReplies.push(video);
      }

      return videoReplies;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async deleteVideoFromCache(key: string, currentUserId: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const videoCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'videoCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZREM('video', `${key}`);
      multi.DEL(`videos:${key}`);
      multi.DEL(`comments:${key}`);
      multi.DEL(`reactions:${key}`);
      const count: number = parseInt(videoCount[0], 10) - 1;
      multi.HSET(`users:${currentUserId}`, 'videoCount', count);
      await multi.exec();
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateVideoInCache(key: string, updatedVideo: IVideoDocument): Promise<IVideoDocument> {
    const { title, description, linkedVideos, privacy, tags, categories, thumbnailVersion, thumbnailId } = updatedVideo;
    const dataToSave = {
      title: `${title}`,
      description: `${description}`,
      thumbnailVersion: `${thumbnailVersion}`,
      thumbnailId: `${thumbnailId}`,
      linkedVideos: `${linkedVideos}`,
      tags: `${tags}`,
      categories: `${categories}`,
      privacy: `${privacy}`
    };

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      for (const [itemKey, itemValue] of Object.entries(dataToSave)) {
        await this.client.HSET(`video:${key}`, `${itemKey}`, `${itemValue}`);
      }
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.HGETALL(`video:${key}`);
      const reply: VideoCacheMultiType = (await multi.exec()) as VideoCacheMultiType;
      const videoReply = reply as IVideoDocument[];
      videoReply[0].commentsCount = Helpers.parseJson(`${videoReply[0].commentsCount}`) as number;
      // videoReply[0].reactions = Helpers.parseJson(`${videoReply[0].reactions}`) as IReactions;
      videoReply[0].updatedAt = new Date(Helpers.parseJson(`${videoReply[0].updatedAt}`)) as Date;

      return videoReply[0];
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error. Try again.');
    }
  }
}
