import type { User } from '@prisma/client';

import { PrismaClient } from '@prisma/client';

import { BadRequestError } from '../errors/bad-request-error';
import { NotFound } from '../errors/not-found-error';
import { Password } from '../utils/password';

// Singleton pattern for Prisma client
class PrismaClientSingleton {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaClientSingleton.instance) {
      PrismaClientSingleton.instance = new PrismaClient();
    }
    return PrismaClientSingleton.instance;
  }
}

// Use the singleton
const prisma = PrismaClientSingleton.getInstance();

// Interfaces for better type safety and reusability
export type CreateUserData = {
  email: string;
  name: string;
  phone: string;
  password: string;
};

export type UpdateUserData = {
  email?: string;
  name?: string;
  phone?: string;
  password?: string;
};

export class UserModel {
  /**
   * Create a new user
   * @param userData - User data to create
   * @returns Newly created user
   * @throws BadRequestError if email/phone already exists
   */
  static async create(userData: CreateUserData): Promise<User> {
    try {
      const hashedPassword = await Password.toHash(userData.password);

      return await prisma.user.create({
        data: {
          ...userData,
          password: hashedPassword,
        },
      });
    }
    catch (error: any) {
      UserModel.handlePrismaError(error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Find user by ID
   * @param id - User ID to find
   * @returns User if found
   * @throws NotFound if user doesn't exist
   */
  static async findById(id: string): Promise<User> {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFound('User not found');
    }

    return user;
  }

  /**
   * Find user by email
   * @param email - Email to search
   * @returns User or null if not found
   */
  static async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Find user by phone
   * @param phone - Phone number to search
   * @returns User or null if not found
   */
  static async findByPhone(phone: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { phone } });
  }

  /**
   * Update user
   * @param id - User ID to update
   * @param data - Fields to update
   * @returns Updated user
   * @throws NotFound if user doesn't exist
   * @throws BadRequestError if update violates constraints
   */
  static async update(id: string, data: UpdateUserData): Promise<User> {
    try {
      const updateData = { ...data };

      if (updateData.password) {
        updateData.password = await Password.toHash(updateData.password);
      }

      return await prisma.user.update({
        where: { id },
        data: updateData,
      });
    }
    catch (error: any) {
      UserModel.handlePrismaError(error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Delete user
   * @param id - User ID to delete
   * @throws NotFound if user doesn't exist
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.user.delete({ where: { id } });
    }
    catch (error: any) {
      UserModel.handlePrismaError(error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Find all users
   * @returns Array of users
   */
  static async findAll(): Promise<User[]> {
    return prisma.user.findMany();
  }

  /**
   * Common error handler for Prisma errors
   * @private
   */
  private static handlePrismaError(error: any): never | void {
    // Not Found error
    if (error.code === 'P2025') {
      throw new NotFound('User not found');
    }

    // Unique constraint violation
    if (error.code === 'P2002') {
      const field = error.meta?.target[0] || 'Field';
      throw new BadRequestError(`${field} is already in use`);
    }
  }
}

// Handle cleanup on application shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
