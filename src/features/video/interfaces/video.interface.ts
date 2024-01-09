import { IReactions } from '@video/interfaces/video.interface';
import { ObjectId } from 'mongodb';
import mongoose, { Document } from 'mongoose';

export interface IVideoDocument extends Document {
  _id?: string | mongoose.Types.ObjectId;
  userId: string;
  username: string;
  videoVersion?: string;
  videoId?: string;
  title: string;
  description: string;
  thumbnailVersion: string;
  thumbnailId: string;
  isDeleted: boolean;
  linkedVideos: [string];
  tags: [string];
  categories: [string];
  videoCopy: string;
  commentsCount: number;
  view: number;
  watchTime: number;
  dislike: number;
  like: number;
  privacy?: string;
  reactions?: IReactions;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IGetVideosQuery {
  _id?: ObjectId | string;
  username?: string;
  videoId?: string;
}

export interface ISaveVideoToCache {
  key: ObjectId | string;
  currentUserId: string;
  uId: string;
  createdVideo: IVideoDocument;
}

export interface IVideoJobData {
  key?: string;
  value?: IVideoDocument;
  keyOne?: string;
  keyTwo?: string;
}

export interface IQueryComplete {
  ok?: number;
  n?: number;
}

export interface IQueryDeleted {
  deletedCount?: number;
}
