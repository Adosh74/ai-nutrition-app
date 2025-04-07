import type { User } from '@prisma/client';

import type { CreateUserData } from './user-model';

import { BadRequestError } from '../errors/bad-request-error';
import { NotFound } from '../errors/not-found-error';
import { prismaMock } from '../test/setup';
import { Password } from '../utils/password';
import { UserModel } from './user-model';

// Mock Password utility
jest.mock('../utils/password');

describe('user-model', () => {
  // Test data
  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    phone: '123-456-7890',
    password: 'hashedPassword.salt',
    createdAt: new Date(),
  };

  const mockCreateUserData: CreateUserData = {
    email: 'test@example.com',
    name: 'Test User',
    phone: '123-456-7890',
    password: 'password123',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Arrange
      (Password.toHash as jest.Mock).mockResolvedValue('hashedPassword.salt');
      prismaMock.user.create.mockResolvedValue(mockUser);

      // Act
      const result = await UserModel.create(mockCreateUserData);

      // Assert
      expect(Password.toHash).toHaveBeenCalledWith(mockCreateUserData.password);
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...mockCreateUserData,
          password: 'hashedPassword.salt',
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestError if email already exists', async () => {
      // Arrange
      (Password.toHash as jest.Mock).mockResolvedValue('hashedPassword.salt');
      const prismaError = new Error('Unique constraint failed');
      Object.defineProperty(prismaError, 'code', { value: 'P2002' });
      Object.defineProperty(prismaError, 'meta', { value: { target: ['email'] } });
      prismaMock.user.create.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(UserModel.create(mockCreateUserData)).rejects.toThrow(BadRequestError);
      await expect(UserModel.create(mockCreateUserData)).rejects.toThrow('email is already in use');
    });
  });

  describe('findById', () => {
    it('should return a user when found by id', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await UserModel.findById(mockUser.id);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFound if user does not exist', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(UserModel.findById('nonexistent-id')).rejects.toThrow(NotFound);
      await expect(UserModel.findById('nonexistent-id')).rejects.toThrow('User not found');
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found by email', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await UserModel.findByEmail(mockUser.email);

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found by email', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await UserModel.findByEmail('nonexistent@example.com');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Arrange
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      prismaMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await UserModel.update(mockUser.id, { name: 'Updated Name' });

      // Assert
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { name: 'Updated Name' },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should hash password when updating password', async () => {
      // Arrange
      const updatedUser = { ...mockUser, password: 'newHashedPassword.salt' };
      (Password.toHash as jest.Mock).mockResolvedValue('newHashedPassword.salt');
      prismaMock.user.update.mockResolvedValue(updatedUser);

      // Act
      const result = await UserModel.update(mockUser.id, { password: 'newPassword' });

      // Assert
      expect(Password.toHash).toHaveBeenCalledWith('newPassword');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: 'newHashedPassword.salt' },
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (Password.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await UserModel.login(mockUser.email, 'password123');

      // Assert
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockUser.email },
      });
      expect(Password.compare).toHaveBeenCalledWith(mockUser.password, 'password123');
      expect(result).toEqual(mockUser);
    });

    it('should throw BadRequestError if user does not exist', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(UserModel.login('wrong@example.com', 'password123')).rejects.toThrow(BadRequestError);
      await expect(UserModel.login('wrong@example.com', 'password123')).rejects.toThrow('Invalid credentials');
    });

    it('should throw BadRequestError if password is incorrect', async () => {
      // Arrange
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      (Password.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(UserModel.login(mockUser.email, 'wrongPassword')).rejects.toThrow(BadRequestError);
      await expect(UserModel.login(mockUser.email, 'wrongPassword')).rejects.toThrow('Invalid credentials');
    });
  });

  // Test remaining methods (findByPhone, delete, findAll)
  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Arrange
      prismaMock.user.delete.mockResolvedValue(mockUser);

      // Act
      await UserModel.delete(mockUser.id);

      // Assert
      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
    });

    it('should throw NotFound if user does not exist', async () => {
      // Arrange
      const prismaError = new Error('Record not found');
      Object.defineProperty(prismaError, 'code', { value: 'P2025' });
      prismaMock.user.delete.mockRejectedValue(prismaError);

      // Act & Assert
      await expect(UserModel.delete('nonexistent-id')).rejects.toThrow(NotFound);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      // Arrange
      const users = [mockUser, { ...mockUser, id: 'user2', email: 'user2@example.com' }];
      prismaMock.user.findMany.mockResolvedValue(users);

      // Act
      const result = await UserModel.findAll();

      // Assert
      expect(prismaMock.user.findMany).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result.length).toBe(2);
    });
  });
});
