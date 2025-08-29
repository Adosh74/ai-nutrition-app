import type { Meal } from '@prisma/client';

import { NotFound } from '../errors/not-found-error';
import { prisma } from './prisma-client/prima-client';

export type CreateMealData = Omit<Meal, 'id' | 'createdAt' | 'planId'> & {
  planId: string;
};

export type UpdateMealData = Partial<Omit<Meal, 'id' | 'createdAt' | 'planId'>>;

export class MealModel {
  /**
   * Create a new meal
   * @param mealData - Meal data to create
   * @returns Newly created meal
   */
  static async create(mealData: CreateMealData): Promise<Meal> {
    try {
      return await prisma.meal.create({
        data: mealData,
      });
    }
    catch (error) {
      MealModel.handlePrismaError(error);
      throw error;
    }
  }

  /**
   * Find meal by ID
   * @param id - Meal ID to find
   * @returns Meal if found
   * @throws NotFound if meal doesn't exist
   */
  static async findById(id: string): Promise<Meal> {
    const meal = await prisma.meal.findUnique({ where: { id } });

    if (!meal) {
      throw new NotFound('Meal not found');
    }

    return meal;
  }

  /**
   * Update meal by ID
   * @param id - Meal ID to update
   * @param mealData - Meal data to update
   * @returns Updated meal
   * @throws NotFound if meal doesn't exist
   */

  static async updateById(id: string, mealData: UpdateMealData): Promise<Meal> {
    try {
      return await prisma.meal.update({
        where: { id },
        data: mealData,
      });
    }
    catch (error: any) {
      MealModel.handlePrismaError(error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * Delete meal by ID
   * @param id - Meal ID to delete
   * @throws NotFound if meal doesn't exist
   */

  static async deleteById(id: string): Promise<void> {
    try {
      await prisma.meal.delete({ where: { id } });
    }
    catch (error: any) {
      MealModel.handlePrismaError(error);
      throw error; // Re-throw unexpected errors
    }
  }

  /**
   * handle Prisma errors
   * @param error - Prisma error to handle
   * @throws NotFound if meal doesn't exist
   * @throws void for unhandled errors
   */
  private static handlePrismaError(error: any): never | void {
    if (error.code === 'P2025') {
      throw new NotFound('Meal not found');
    }
  }
}
