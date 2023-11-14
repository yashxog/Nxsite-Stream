import mongoose, { Document } from 'mongoose';
import { ObjectId } from 'mongodb';

/* IUserDocument to store users data in mongodb and redis */
/* edited */
export interface IUserDocument extends Document {
  _id: string | ObjectId;
  authId: string | ObjectId;
  username?: string;
  name?: string;
  gender?: string;
  dob?: Date;
  email?: string;
  mobileNumber?: number;
  password?: string;
  avatarColor?: string;
  uId?: string;
  videoPostsCount: number;
  work: string;
  school: string;
  quote: string;
  location: string;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  cicrleJoinedCount: number;
  circleMembersCount: number;
  notifications: INotificationSettings;
  social: ISocialLinks;
  bgImageVersion: string;
  bgImageId: string;
  profilePicture: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
  createdAt?: Date;
}

export interface IUser {
  _id: string | ObjectId;
  authId: string | ObjectId;
  uId: string;
  username: string;
  name: string;
  gender: string;
  dob: Date;
  email: string;
  mobileNumber: number;
  password?: string;
  avatarColor: string;
  createdAt: Date;
  videoPostsCount: number;
  work: string;
  school: string;
  quote: string;
  location: string;
  blocked: mongoose.Types.ObjectId[];
  blockedBy: mongoose.Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  cicrleJoinedCount: number;
  circleMemberCount: number;
  notifications: INotificationSettings;
  social: ISocialLinks;
  bgImageVersion: string;
  bgImageId: string;
  profilePicture: string;
  passwordResetToken?: string;
  passwordResetExpires?: number | string;
}

export interface IResetPasswordParams {
  username: string;
  email: string;
  ipaddress: string;
  date: string;
}

export interface INotificationSettings {
  messages: boolean;
  reactions: boolean;
  comments: boolean;
  follows: boolean;
}

export interface IBasicInfo {
  quote: string;
  work: string;
  school: string;
  location: string;
}

export interface ISocialLinks {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

export interface ISearchUser {
  _id: string;
  profilePicture: string;
  username: string;
  email: string;
  avatarColor: string;
}

export interface ISocketData {
  blockedUser: string;
  blockedBy: string;
}

export interface ILogin {
  userId: string;
}

export interface IUserJobInfo {
  key?: string;
  value?: string | ISocialLinks;
}

export interface IUserJob {
  keyOne?: string;
  keyTwo?: string;
  key?: string;
  value?: string | INotificationSettings | IUserDocument;
}

export interface IEmailJob {
  receiverEmail: string;
  template: string;
  subject: string;
}

export interface IAllUsers {
  users: IUserDocument[];
  totalUsers: number;
}
