import Joi, { ObjectSchema } from 'joi';

const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(30).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username',
    'string.max': 'Invalid username',
    'string.empty': 'Username is a required field'
  }),
  name: Joi.string().required().messages({
    'string.base': 'name is required field'
  }),
  password: Joi.string().required().min(4).max(20).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  dob: Joi.string()
    .required()
    .pattern(/^(\d{2}-\d{2}-\d{4})$/)
    .messages({
      'string.pattern.base': 'Date of birth must be in DD-MM-YYYY format',
      'any.required': 'Date of birth is a required field'
    }),
  avatarImage: Joi.string().required().messages({
    'any.required': 'Avatar image is required'
  }),
  mobileNumber: Joi.string()
    .required()
    .pattern(/^[0-9]{10}$/)
    .message('Mobile number must be a valid 10-digit number'),
  gender: Joi.string().required().valid('male', 'female', 'other')
});

export { signupSchema };
