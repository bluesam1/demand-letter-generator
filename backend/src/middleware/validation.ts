import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { errorResponse } from '../utils/response.js';

export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      errorResponse(res, 'VALIDATION_ERROR', 'Request validation failed', 400, details);
      return;
    }

    req[property] = value;
    next();
  };
};
