import { BaseCache } from '@services/redis/base.cache';
import Logger from 'bunyan';
import { ServerError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import { ISavePostToCache } from '@post/interfaces/post.interface';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log: Logger = config.createLogger('userCache');

export class PostCache extends BaseCache {
  constructor() {
    super('postCache');
  }

  public async savePostToCache(data: ISavePostToCache): Promise<void> {
    const { key, currentUserId, uId, createdPost } = data;

    const {
      _id,
      userId,
      username,
      email,
      profilePicture,
      post,
      bgColor,
      commentsCount,
      imgVersion,
      imgId,
      feelings,
      gifUrl,
      privacy,
      reactions,
      createdAt
    } = createdPost;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'userId',
      `${userId}`,
      'username',
      `${username}`,
      'email',
      `${email}`,
      'profilePicture',
      `${profilePicture}`,
      'post',
      `${post}`,
      'bgColor',
      `${bgColor}`,
      'gifUrl',
      `${gifUrl}`,
      'feelings',
      `${feelings}`,
      'privacy',
      `${privacy}`
    ];

    const secondList: string[] = [
      'commentCount',
      `${commentsCount}`,
      'reactions',
      JSON.stringify(reactions),
      'imgVersion',
      `${imgVersion}`,
      'imgId',
      `${imgId}`,
      'createdAt',
      `${createdAt}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const postCount: string[] = await this.client.HMGET(`users:${currentUserId}`, 'postCount');
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      multi.ZADD('post', { score: parseInt(uId, 10), value: `${key}` });
      multi.HSET(`posts: ${key}`, dataToSave);
      const count: number = parseInt(postCount[0], 10) + 1;
      multi.HSET(`user:${currentUserId}`, ['postCount', count]);
      multi.exec();
    } catch (error) {
      // log.error(error);
      console.log(error);
      throw new ServerError('Server error. try again.');
    }
  }
}
