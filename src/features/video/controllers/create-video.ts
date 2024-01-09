import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { IVideoDocument } from '@video/interfaces/video.interface';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';
// import { socketIOVideoObject } from '@root/shared/sockets/video';
import { UploadApiResponse } from 'cloudinary';
import { uploads, videoUpload } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { videoSchema } from '@video/schemes/video.schemes';
import { VideoCache } from '@services/redis/video.cache';
import { videoQueue } from '@services/queues/video.queue';

const videoCache: VideoCache = new VideoCache();

export class Create {
  @joiValidation(videoSchema)
  public async uploadVideo(req: Request, res: Response): Promise<void> {
    const { video, thumbnail, title, description, tags, categories, linkedVideos, videoCopy, privacy } = req.body;

    const videoResult: UploadApiResponse = (await videoUpload(video)) as UploadApiResponse;
    if (!videoResult?.public_id) {
      throw new BadRequestError(videoResult.message);
    }

    let thumbnailResult: UploadApiResponse;
    let thumbnailVersion = '';
    let thumbnailId = '';
    if (thumbnail) {
      thumbnailResult = (await uploads(thumbnail)) as UploadApiResponse;
      if (!thumbnailResult?.public_id) {
        throw new BadRequestError(thumbnailResult.message);
      }
      thumbnailVersion = thumbnailResult?.version.toString();
      thumbnailId = thumbnailResult?.public_id;
    }

    const videoObjectId: ObjectId = new ObjectId();
    const createdVideo: IVideoDocument = {
      _id: videoObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      videoVersion: videoResult.version.toString(),
      videoId: videoResult.public_id,
      thumbnailVersion,
      thumbnailId,
      title,
      description,
      tags,
      categories: categories || [],
      linkedVideos: linkedVideos || [],
      videoCopy: videoCopy || '',
      privacy: privacy || '',
      isDeleted: false,
      commentsCount: 0,
      view: 0,
      watchTime: 0,
      dislike: 0,
      like: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, sad: 0, wow: 0, angry: 0 }
    } as IVideoDocument;

    console.log(createdVideo);

    await videoCache.saveVideoToCache({
      key: videoObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdVideo
    });

    videoQueue.addVideoJob('addVideoToDB', { key: req.currentUser!.userId, value: createdVideo });
    res.status(HTTP_STATUS.CREATED).json({ message: 'Video uploaded Successfully' });
  }
}
