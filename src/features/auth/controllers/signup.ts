import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { uploads } from '@globals/helpers/cloudinary-upload';
import { UploadApiResponse } from 'cloudinary';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserCache } from '@services/redis/user.cache';
import { omit } from 'lodash';
import JWT from 'jsonwebtoken';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import { config } from '@root/config';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, name, gender, dob, mobileNumber, email, password, avatarImage } = req.body;

    // checking if user exist in db
    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(username, email);
    if (checkIfUserExist) {
      throw new BadRequestError('Invalid Credentials');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;
    const authData: IAuthDocument = SignUp.prototype.signupData({
      _id: authObjectId,
      uId,
      username,
      name,
      gender,
      dob,
      email: Helpers.lowerCase(email),
      mobileNumber,
      password,
    });

    // uploding picture to cloudnairy
    const result: UploadApiResponse = (await uploads(avatarImage, `${userObjectId}`, true, true)) as UploadApiResponse;
    if (!result?.public_id) {
      throw new BadRequestError('File uplode: Error occured. Try again');
    }

    //Add to redis cache
    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res?cloudinary.com/doddxbg91/image/upload/v${result.version}/${userObjectId}`;
    await userCache.savedUserToCache(`${userObjectId}`, uId, userDataForCache);

    // Add to database
    omit(userDataForCache, ['uId', 'username', 'name', 'gender', 'dob', 'password', 'avatarColor', 'mobileNumber']);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signToken(authData, userObjectId);
    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User Created Successfully', user: userDataForCache, token: userJwt });
  }

  private signToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return JWT.sign(
      {
        userId: userObjectId,
        uID: data.uId,
        email: data.email,
        userName: data.username,
        name: data.name,
        gender: data.gender,
        dob: data.dob,
        mobileNumber: data.mobileNumber,
      },
      config.JWT_TOKEN!
    );
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const { _id, uId, username, name, gender, dob, email, mobileNumber, password } = data;
    return {
      _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      name: Helpers.firstLetterUppercase(name),
      gender,
      dob,
      email: Helpers.lowerCase(email),
      mobileNumber,
      password,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, name, gender, dob, email, mobileNumber, uId, password } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      name,
      gender,
      dob,
      email,
      mobileNumber,
      password,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      cicrleJoinedCount: 0,
      circleMemberCount: 0,
      videoPostsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }
}
