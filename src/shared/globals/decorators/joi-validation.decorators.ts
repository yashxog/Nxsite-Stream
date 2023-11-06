import { JoiRequestValidationError } from '@globals/helpers/error-handler';
import { Request } from 'express';
import { ObjectSchema } from 'joi';

type IJoiDecorator = (target: any, key: string, descriptor: PropertyDescriptor) => void;


export function joiValidation(schema: ObjectSchema): IJoiDecorator {

  return ( _target: any, _key: string, descriptor: PropertyDescriptor) => {
    const orignalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const req: Request = args[0];
      const { error } = await Promise.resolve(schema.validate(req.body));
      if (error?.details) {
        throw new JoiRequestValidationError(error.details[0].message);
      }
      return orignalMethod.apply(this, args);
      };
    return descriptor;
  };
}
