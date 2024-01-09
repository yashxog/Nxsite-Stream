import { IVideoDocument } from '@video/interfaces/video.interface';
import mongoose, { model, Model, Schema } from 'mongoose';

const videoSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  username: { type: String },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  videoVersion: { type: String, default: '' },
  videoId: { type: String, default: '' },
  thumbnailVersion: { type: String, default: '' },
  thumbnailId: { type: String, default: '' },
  isDeleted: { type: Boolean, default: 'false' },
  linkedVideos: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  categories: { type: [String], default: [] },
  videoCopy: { type: String, default: '' },
  privacy: { type: String, default: '' },
  commentsCount: { type: Number, default: 0 },
  view: { type: Number, default: 0 },
  watchTime: { type: Number, default: 0 },
  like: { type: Number, default: 0 },
  dislike: { type: Number, default: 0 },
  reactions: {
    like: { type: Number, default: 0 },
    love: { type: Number, default: 0 },
    happy: { type: Number, default: 0 },
    wow: { type: Number, default: 0 },
    sad: { type: Number, default: 0 },
    angry: { type: Number, default: 0 }
  },
  createdAt: { type: Date, default: Date.now },
  updateAt: { type: Date, default: Date.now }
});

const VideoModel: Model<IVideoDocument> = model<IVideoDocument>('Video', videoSchema, 'Video');

export { VideoModel };
