import Joi from 'joi';

// Auth validation schemas
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
});

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'Password is required',
  }),
  firstName: Joi.string().min(1).max(100).required().messages({
    'string.max': 'First name must be less than 100 characters',
    'any.required': 'First name is required',
  }),
  lastName: Joi.string().min(1).max(100).required().messages({
    'string.max': 'Last name must be less than 100 characters',
    'any.required': 'Last name is required',
  }),
  firmName: Joi.string().min(1).max(255).required().messages({
    'string.max': 'Firm name must be less than 255 characters',
    'any.required': 'Firm name is required',
  }),
});

// Letter validation schemas
export const createLetterSchema = Joi.object({
  clientName: Joi.string().min(1).max(255).required().messages({
    'string.max': 'Client name must be less than 255 characters',
    'any.required': 'Client name is required',
  }),
  defendantName: Joi.string().min(1).max(255).required().messages({
    'string.max': 'Defendant name must be less than 255 characters',
    'any.required': 'Defendant name is required',
  }),
  templateId: Joi.string().uuid().optional().allow(null),
  caseReference: Joi.string().max(100).optional().allow(null),
  incidentDate: Joi.date().iso().optional().allow(null),
  demandAmount: Joi.number().positive().precision(2).optional().allow(null),
});

export const updateLetterSchema = Joi.object({
  clientName: Joi.string().min(1).max(255).optional(),
  defendantName: Joi.string().min(1).max(255).optional(),
  content: Joi.string().optional().allow(null),
  status: Joi.string().valid('Draft', 'In Review', 'Finalized', 'Exported').optional(),
  caseReference: Joi.string().max(100).optional().allow(null),
  incidentDate: Joi.date().iso().optional().allow(null),
  demandAmount: Joi.number().positive().precision(2).optional().allow(null),
});

// Template validation schemas
export const createTemplateSchema = Joi.object({
  templateName: Joi.string().min(1).max(255).required().messages({
    'string.max': 'Template name must be less than 255 characters',
    'any.required': 'Template name is required',
  }),
  templateDescription: Joi.string().optional().allow(null),
  templateContent: Joi.object().required().messages({
    'any.required': 'Template content is required',
  }),
  category: Joi.string().max(100).optional().allow(null),
  isDefault: Joi.boolean().optional(),
});

export const updateTemplateSchema = Joi.object({
  templateName: Joi.string().min(1).max(255).optional(),
  templateDescription: Joi.string().optional().allow(null),
  templateContent: Joi.object().optional(),
  category: Joi.string().max(100).optional().allow(null),
  isDefault: Joi.boolean().optional(),
});

// User profile validation schema
export const updateUserProfileSchema = Joi.object({
  firstName: Joi.string().min(1).max(100).optional(),
  lastName: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
});

// Pagination and query parameters
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});
