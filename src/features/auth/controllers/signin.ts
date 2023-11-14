import { Request, Response } from 'express';
import { config } from '@root/config';
import JWT from 'jsonwebtoken';
import { joiValidation } from '@globals/decorators/joi-validation.decorators';
import HTTP_STATUS from 'http-status-codes';
import { authService } from '@services/db/auth.service';
import { loginSchema } from '@auth/schemes/signin';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    // checking if user exist in db
    const existingUser: IAuthDocument = await authService.getUserByUsername(username);
    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials');
    }
    const passwordsMatch: boolean = await existingUser.comparePassword(password);
    if (!passwordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = JWT.sign(
      {
        userId: user._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        name: existingUser.name,
        gender: existingUser.gender,
        dob: existingUser.dob,
        mobileNumber: existingUser.mobileNumber,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      uId: existingUser!.uId,
      email: existingUser!.email,
      username: existingUser!.username,
      name: existingUser!.name,
      gender: existingUser!.gender,
      dob: existingUser!.dob,
      mobileNumber: existingUser!.mobileNumber,
      avatarColor: existingUser!.avatarColor,
      createdAt: existingUser!.createdAt
    } as IUserDocument;

    res.status(HTTP_STATUS.OK).json({ message: 'User login Successfully', user: userDocument, token: userJwt });
  }
}
