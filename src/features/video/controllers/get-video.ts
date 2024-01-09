import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { IVideoDocument } from '@video/interfaces/video.interface';
import { videoService } from '@services/db/video.service';

export class Get {
  public async randomVideos(req: Request, res: Response): Promise<void> {
    let videos: IVideoDocument[] = [];
    videos = await videoService.getRandomVideos();
    res.status(HTTP_STATUS.OK).json({ message: 'All videos', videos });
  }

  public async videosByTags(req: Request, res: Response): Promise<void> {
    const tags: string = req.query.tags as string;
    let videos: IVideoDocument[] = [];
    videos = await videoService.getVideosByTags(tags);
    res.status(HTTP_STATUS.OK).json({ message: 'All videos', videos });
  }

  public async searchVideos(req: Request, res: Response): Promise<void> {
    const query: string = req.query.q as string;
    let videos: IVideoDocument[] = [];
    videos = await videoService.getVideosBySearch(query);
    res.status(HTTP_STATUS.OK).json({ message: 'All videos', videos });
  }
}
