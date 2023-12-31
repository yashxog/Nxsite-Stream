import { BaseCache } from '@services/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { ServerError } from '@globals/helpers/error-handler';
import { config } from '@root/config';
import { Helpers } from '@globals/helpers/helpers';
import Logger from 'bunyan';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor() {
    super('userCache');
  }

  public async savedUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      name,
      gender,
      dob,
      email,
      mobileNumber,
      videoPostsCount,
      blocked,
      blockedBy,
      followersCount,
      followingCount,
      cicrleJoinedCount,
      circleMembersCount,
      notifications,
      bgImageId,
      bgImageVersion,
      profilePicture,
      social
    } = createdUser;

    const firstList: string[] = [
      '_id',
      `${_id}`,
      'uId',
      `${uId}`,
      'username',
      `${username}`,
      'name',
      `${name}`,
      'gender',
      `${gender}`,
      'dob',
      `${dob}`,
      'email',
      `${email}`,
      'mobileNumber',
      `${mobileNumber}`,
      'createdAt',
      `${createdAt}`,
      'videoPostsCount',
      `${videoPostsCount}`
    ];

    const secondList: string[] = [
      'blocked',
      JSON.stringify(blocked),
      'blockedBy',
      JSON.stringify(blockedBy),
      'profilePicture',
      `${profilePicture}`,
      'followersCount',
      `${followersCount}`,
      'followingCount',
      `${followingCount}`,
      'cicrleJoinedCount',
      `${cicrleJoinedCount}`,
      'circleMembersCount',
      `${circleMembersCount}`,
      'notifications',
      JSON.stringify(notifications),
      'social',
      JSON.stringify(social)
    ];

    const thirdList: string[] = [
      'bgImageId',
      `${bgImageId}`,
      'bgImageVersion',
      `${bgImageVersion}`
    ];

    const dataToSave: string[] = [...firstList, ...secondList, ...thirdList];

    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', { score: parseInt(userUId, 10), value: `${key}` });
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      // log.error(error);
      console.log(error);
      throw new ServerError('Server error. try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      response.videoPostsCount = Helpers.parseJson(`${response.videoPostsCount}`);
      response.blocked = Helpers.parseJson(`${response.blocked}`);
      response.blockedBy = Helpers.parseJson(`${response.blockedBy}`);
      response.notifications = Helpers.parseJson(`${response.notifications}`);
      response.social = Helpers.parseJson(`${response.social}`);
      response.followersCount = Helpers.parseJson(`${response.followersCount}`);
      response.followingCount = Helpers.parseJson(`${response.followingCount}`);
      response.cicrleJoinedCount = Helpers.parseJson(`${response.cicrleJoinedCount}`);
      response.circleMembersCount = Helpers.parseJson(`${response.circleMembersCount}`);

      return response;
    } catch (error) {
      // log.error(error);
      console.log(error);
      throw new ServerError('Server error. try again.');
    }
  }
}
