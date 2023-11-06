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
import { UploadApiResponse }  from 'cloudinary';


export class SignUp {

  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, name, gender, dob, mobileNumber, email, password, avatarColor, avatarImage } = req.body;
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
      avatarColor,
    });
    const result: UploadApiResponse = await uploads(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;
    if(!result?.public_id) {
      throw new BadRequestError('File uplode: Error occured. Try again');
    }

    res.status(HTTP_STATUS.CREATED).json({message: 'User Created Successfully', authData});
  }

  private signupData(data: ISignUpData): IAuthDocument {
    const {_id, uId, username, name, gender, dob, email, mobileNumber, password, avatarColor} = data;
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
      avatarColor,
      createdAt: new Date(),
    } as IAuthDocument;
  }
}

