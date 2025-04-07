import type { Request, Response } from 'express';

import { body, param } from 'express-validator';

import type { CreateUserData, UpdateUserData } from '../models/user-model';

import { BadRequestError } from '../errors/bad-request-error';
import { UserModel } from '../models/user-model';

export class UserController {
  /**
   * Register a new user
   * Route: POST /api/users
   */
  static registerValidation = [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('phone')
      .trim()
      .notEmpty()
      .withMessage('Phone number is required'),
    body('password')
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('Password must be between 8 and 20 characters'),
  ];

  static async register(req: Request, res: Response) {
    const { email, name, phone, password } = req.body as CreateUserData;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new BadRequestError('Email already in use');
    }

    const user = await UserModel.create({
      email,
      name,
      phone,
      password,
    });

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(201).send(userResponse);
  }

  /**
   * Login a user
   * Route: POST /api/users/login
   */
  static loginValidation = [
    body('email')
      .isEmail()
      .withMessage('Email must be valid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required'),
  ];

  static async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await UserModel.login(email, password);

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.status(200).send(userResponse);
  }

  /**
   * Get a user by ID
   * Route: GET /api/users/:id
   */
  static idParamValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
  ];

  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    // Remove password from response
    const { password, ...userResponse } = user;

    res.status(200).send(userResponse);
  }

  /**
   * Get all users
   * Route: GET /api/users
   */
  static async getAll(req: Request, res: Response) {
    const users = await UserModel.findAll();

    // Remove passwords from response
    const usersResponse = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.status(200).send(usersResponse);
  }

  /**
   * Update a user
   * Route: PUT /api/users/:id
   */
  static updateValidation = [
    param('id').isUUID().withMessage('Valid user ID is required'),
    body('email').optional().isEmail().withMessage('Email must be valid'),
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
    body('password')
      .optional()
      .trim()
      .isLength({ min: 8, max: 20 })
      .withMessage('Password must be between 8 and 20 characters'),
  ];

  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const updateData: UpdateUserData = req.body;

    // Ensure user exists
    await UserModel.findById(id);

    const updatedUser = await UserModel.update(id, updateData);

    // Remove password from response
    const { password, ...userResponse } = updatedUser;

    res.status(200).send(userResponse);
  }

  /**
   * Delete a user
   * Route: DELETE /api/users/:id
   */
  static async delete(req: Request, res: Response) {
    const { id } = req.params;

    // Ensure user exists
    await UserModel.findById(id);

    await UserModel.delete(id);

    res.status(204).send();
  }
}
