import { IVideoDocument } from '@video/interfaces/video.interface';
import { VideoModel } from '@video/models/video.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/users.schema';
import { UpdateQuery } from 'mongoose';

class VideoService {
  public async addVideoToDB(userId: string, createdPost: IVideoDocument): Promise<void> {
    const video: Promise<IVideoDocument> = VideoModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { videoPostsCount: 1 } });
    await Promise.all([video, user]);
  }

  public async videoCount(): Promise<number> {
    const count: number = await VideoModel.find({}).countDocuments();
    return count;
  }

  public async editVideo(videoId: string, updatedPost: IVideoDocument): Promise<void> {
    const updateVideo: UpdateQuery<IVideoDocument> = VideoModel.updateOne({ _id: videoId }, { $set: updatedPost });
    await Promise.all([updateVideo]);
  }

  public async deleteVideo(videoId: string): Promise<void> {
    const deleteVideo: UpdateQuery<IVideoDocument> = VideoModel.updateOne({ _id: videoId }, { $set: { isDeleted: true } });
    await Promise.all([deleteVideo]);
  }

  public async getVideoById(videoId: string): Promise<void> {
    const video = VideoModel.findOne({ _id: videoId }); //type is not given to video
    await Promise.all([video]);
  }

  public async getVideoByUserId(userId: string): Promise<void> {
    const video = VideoModel.findOne({ userId });
    await Promise.all([video]);
  }

  public async getRandomVideos(): Promise<IVideoDocument[]> {
    const videos: IVideoDocument[] = await VideoModel.aggregate([{ $match: { isDeleted: false } }, { $sample: { size: 40 } }]);
    return videos;
  }

  public async getTerendingVideos(): Promise<IVideoDocument[]> {
    const videos: IVideoDocument[] = await VideoModel.find({ isDeleted: false }).sort({ views: -1 });
    return videos;
  }

  //In this fiunction tags is a query which is searched :- tags?q=crypto,trading,motivation
  public async getVideosByTags(tags: string): Promise<IVideoDocument[]> {
    const allTags = tags.split(',');
    const videos: IVideoDocument[] = await VideoModel.find({ tags: { $in: allTags }, isDeleted: false }).limit(40);
    return videos;
  }

  //In this fiunction tags is array because we directly taking field from user collection
  //Returns videos similar to user intrest
  public async getSimilarVideosByTags(tags: [string]): Promise<IVideoDocument[]> {
    const videos: IVideoDocument[] = await VideoModel.aggregate([{ $match: { tags: { $in: tags }, isDeleted: false } }]).limit(40);
    return videos;
  }

  public async getVideosBySearch(query: string): Promise<IVideoDocument[]> {
    const videos: IVideoDocument[] = await VideoModel.find({ title: { $regex: query, $options: 'i' }, isDeleted: false }).limit(40);
    return videos;
  }
}

export const videoService: VideoService = new VideoService();
