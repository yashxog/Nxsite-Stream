import Joi, { ObjectSchema } from 'joi';

const videoSchema: ObjectSchema = Joi.object().keys({
  video: Joi.string().required().messages({
    'any.required': 'Video is required',
    'string.empty': 'Video property is not allowed to be empty'
  }),
  title: Joi.string().required().messages({
    'any.required': 'Title is required',
    'string.empty': 'Title property cannot be empty'
  }),
  thumbnail: Joi.string().optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  tags: Joi.array().items(Joi.string().optional().allow(null, '')),
  categories: Joi.string().optional().allow(null, ''),
  linkedVideos: Joi.string().optional().allow(null, ''),
  videoCopy: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, '')
});

const videoUploadingSchema: ObjectSchema = Joi.object().keys({
  video: Joi.string().optional().allow(null, ''),
  title: Joi.string().optional().allow(null, ''),
  thumbnail: Joi.string().optional().allow(null, ''),
  description: Joi.string().optional().allow(null, ''),
  tags: Joi.array().items(Joi.string().optional().allow(null, '')),
  categories: Joi.string().optional().allow(null, ''),
  linkedVideos: Joi.string().optional().allow(null, ''),
  videoCopy: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, '')
});

export { videoSchema, videoUploadingSchema };
