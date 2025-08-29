import type { Meal } from '@prisma/client';

import type { CreateMealData } from '../meal-model';

import { NotFound } from '../../errors/not-found-error';
import { prismaMock } from '../../test/setup';
import { MealModel } from '../meal-model';

describe('meal-model', () => {
  // Test data
  const mockMeal: Meal = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    name: 'Chicken Salad',
    calories: 350,
    carbs: 20,
    protein: 30,
    fat: 15,
    createdAt: new Date(),
    planId: 'plan123',
  };

  const mockCreateMealData: CreateMealData = {
    name: 'Chicken Salad',
    calories: 350,
    carbs: 20,
    protein: 30,
    fat: 15,
    planId: 'plan123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new meal successfully', async () => {
      // Arrange
      prismaMock.meal.create.mockResolvedValue(mockMeal);

      // Act
      const result = await MealModel.create(mockCreateMealData);

      // Assert
      expect(prismaMock.meal.create).toHaveBeenCalledWith({
        data: mockCreateMealData,
      });
      expect(result).toEqual(mockMeal);
    });
  });

  describe('findById', () => {
    it('should return a meal when found by id', async () => {
      // Arrange
      prismaMock.meal.findUnique.mockResolvedValue(mockMeal);

      // Act
      const result = await MealModel.findById(mockMeal.id);

      // Assert
      expect(prismaMock.meal.findUnique).toHaveBeenCalledWith({
        where: { id: mockMeal.id },
      });
      expect(result).toEqual(mockMeal);
    });

    it('should throw NotFound if meal does not exist', async () => {
      // Arrange
      prismaMock.meal.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(MealModel.findById('nonexistent-id')).rejects.toThrow(NotFound);
      await expect(MealModel.findById('nonexistent-id')).rejects.toThrow('Meal not found');
    });
  });

  describe('updateById', () => {
    it('should update a meal successfully', async () => {
      // Arrange
      const updatedMeal = { ...mockMeal, name: 'Updated Meal' };
      prismaMock.meal.update.mockResolvedValue(updatedMeal);

      // Act
      const result = await MealModel.updateById(mockMeal.id, { name: 'Updated Meal' });

      // Assert
      expect(prismaMock.meal.update).toHaveBeenCalledWith({
        where: { id: mockMeal.id },
        data: { name: 'Updated Meal' },
      });
      expect(result).toEqual(updatedMeal);
    });

    it('should throw NotFound if meal does not exist', async () => {
      // Arrange
      const prismaError = new Error('Record not found');
      Object.defineProperty(prismaError, 'code', { value: 'P2025' });
      prismaMock.meal.update.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(MealModel.updateById('nonexistent-id', { name: 'Updated Meal' })).rejects.toThrow(NotFound);
    });
  });

  describe('deleteById', () => {
    it('should delete a meal successfully', async () => {
      // Arrange
      prismaMock.meal.delete.mockResolvedValue(mockMeal);

      // Act
      await MealModel.deleteById(mockMeal.id);

      // Assert
      expect(prismaMock.meal.delete).toHaveBeenCalledWith({
        where: { id: mockMeal.id },
      });
    });

    it('should throw NotFound if meal does not exist', async () => {
      // Arrange
      const prismaError = new Error('Record not found');
      Object.defineProperty(prismaError, 'code', { value: 'P2025' });
      prismaMock.meal.delete.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(MealModel.deleteById('nonexistent-id')).rejects.toThrow(NotFound);
    });
  });
});
