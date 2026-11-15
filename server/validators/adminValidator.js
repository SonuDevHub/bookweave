import Joi from 'joi'

const emailField = Joi.string().trim().lowercase().email({ tlds: { allow: false } }).max(254)

export const adminLoginSchema = Joi.object({
  email: emailField.required().messages({
    'string.base': 'Email and password are required',
    'string.empty': 'Email and password are required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email and password are required',
  }),
  password: Joi.string().min(1).required().messages({
    'string.base': 'Email and password are required',
    'string.empty': 'Email and password are required',
    'any.required': 'Email and password are required',
  }),
})

export const forgotPasswordSchema = Joi.object({
  email: emailField.required().messages({
    'string.base': 'Email is required',
    'string.empty': 'Email is required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required',
  }),
})

export const resetPasswordSchema = Joi.object({
  email: emailField.required().messages({
    'string.base': 'Email, OTP and new password are required',
    'string.empty': 'Email, OTP and new password are required',
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email, OTP and new password are required',
  }),
  otp: Joi.string().trim().pattern(/^\d{6}$/).required().messages({
      'string.base': 'Enter a valid 6-digit OTP',
      'string.empty': 'Email, OTP and new password are required',
      'string.pattern.base': 'Enter a valid 6-digit OTP',
      'any.required': 'Email, OTP and new password are required',
    }),
  password: Joi.string().min(8).max(128).required().messages({
    'string.base': 'Password must be 8–128 characters long',
    'string.empty': 'Email, OTP and new password are required',
    'string.min': 'Password must be 8–128 characters long',
    'string.max': 'Password must be 8–128 characters long',
    'any.required': 'Email, OTP and new password are required',
  }),
})

export const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(1).max(60).required().messages({
    'string.base': 'Name is required',
    'string.empty': 'Name is required',
    'string.max': 'Name cannot exceed 60 characters',
    'any.required': 'Name is required',
  }),
})
