import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { UploadApiResponse } from 'cloudinary';
// import { socketIOVideoObject } from '@root/shared/sockets/video';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';
import { VideoCache } from '@services/redis/video.cache';
import { videoQueue } from '@services/queues/video.queue';
import { videoUploadingSchema } from '@video/schemes/video.schemes';
import { IVideoDocument } from '@video/interfaces/video.interface';

const videoCache: VideoCache = new VideoCache();

export class Update {
  @joiValidation(videoUploadingSchema)
  public async video(req: Request, res: Response): Promise<void> {
    const { thumbnailId, thumbnailVersion } = req.body;
    if (thumbnailId && thumbnailVersion) {
      Update.prototype.updateVideo(req);
    } else {
      const result: UploadApiResponse = await Update.prototype.addThumbnailToExistingVideo(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }
    res.status(HTTP_STATUS.OK).json({ message: 'video updated successfully' });
  }

  private async updateVideo(req: Request): Promise<void> {
    const { title, description, linkedVideos, privacy, tags, categories, thumbnailVersion, thumbnailId } = req.body;
    const { videoId } = req.params;
    const updatedVideo: IVideoDocument = {
      title: title || '',
      description: description || '',
      linkedVideos: linkedVideos || '',
      privacy: privacy || '',
      tags: tags || '',
      categories: categories || '',
      thumbnailId: thumbnailId ? thumbnailId : '',
      thumbnailVersion: thumbnailVersion ? thumbnailVersion : '',
      updatedAt: new Date()
    } as IVideoDocument;

    const videoUpdated: IVideoDocument = await videoCache.updateVideoInCache(videoId, updatedVideo);
    // socketIOVideoObject.emit('update video', videoUpdated, 'video');
    videoQueue.addVideoJob('updateVideoInDB', { key: videoId, value: videoUpdated });
  }

  private async addThumbnailToExistingVideo(req: Request): Promise<UploadApiResponse> {
    const { title, description, linkedVideos, privacy, tags, categories, thumbnail } = req.body;
    const { videoId } = req.params;
    const result: UploadApiResponse = (await uploads(thumbnail)) as UploadApiResponse;
    if (!result?.public_id) {
      return result;
    }
    const updatedVideo: IVideoDocument = {
      title: title || '',
      description: description || '',
      linkedVideos: linkedVideos || '',
      privacy: privacy || '',
      tags: tags || '',
      categories: categories || '',
      thumbnailId: result.public_id,
      thumbnailVersion: result.version.toString(),
      updatedAt: new Date()
    } as IVideoDocument;

    console.log(updatedVideo);
    const videoUpdated: IVideoDocument = await videoCache.updateVideoInCache(videoId, updatedVideo);
    // socketIOVideoObject.emit('update video', videoUpdated, 'video');
    console.log(videoUpdated);
    videoQueue.addVideoJob('updateVideoInDB', { key: videoId, value: videoUpdated });
    return result;
  }
}
