import type { Request, Response } from 'express';

import { BadRequestError } from '../../errors/bad-request-error';
import { UserModel } from '../../models/user-model';
import { UserController } from '../user-controller';

// Mock UserModel methods
jest.mock('../../models/user-model');

// Mock response object
function mockResponse() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
}

describe('user-controller', () => {
  // Sample user data
  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    phone: '1234567890',
    password: 'password123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Setup
      const req = { body: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password123',
      } } as Request;
      const res = mockResponse();

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findByEmail').mockResolvedValue(null);
      jest.spyOn(UserModel, 'create').mockResolvedValue(mockUser);

      // Call controller method
      await UserController.register(req, res);

      // Assertions
      expect(UserModel.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(UserModel.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password123',
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
    });

    it('should throw error if email already exists', async () => {
      // Setup
      const req = { body: {
        email: 'test@example.com',
        name: 'Test User',
        phone: '1234567890',
        password: 'password123',
      } } as Request;

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findByEmail').mockResolvedValue(mockUser);

      // Call controller method & assertions
      await expect(UserController.register(req, mockResponse()))
        .rejects
        .toThrow(BadRequestError);
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Setup
      const req = { body: {
        email: 'test@example.com',
        password: 'password123',
      } } as Request;
      const res = mockResponse();

      // Mock UserModel methods
      jest.spyOn(UserModel, 'login').mockResolvedValue(mockUser);

      // Call controller method
      await UserController.login(req, res);

      // Assertions
      expect(UserModel.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
    });
  });

  describe('getById', () => {
    it('should return a user by ID', async () => {
      // Setup
      const req = { params: { id: mockUser.id } } as unknown as Request;
      const res = mockResponse();

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);

      // Call controller method
      await UserController.getById(req, res);

      // Assertions
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.not.objectContaining({ password: expect.anything() }));
    });
  });

  describe('getAll', () => {
    it('should return all users', async () => {
      // Setup
      const req = {} as Request;
      const res = mockResponse();
      const mockUsers = [mockUser, { ...mockUser, id: '223e4567-e89b-12d3-a456-426614174000' }];

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findAll').mockResolvedValue(mockUsers);

      // Call controller method
      await UserController.getAll(req, res);

      // Assertions
      expect(UserModel.findAll).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.arrayContaining([
        expect.not.objectContaining({ password: expect.anything() }),
      ]));
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      // Setup
      const updateData = { name: 'Updated Name' };
      const req = {
        params: { id: mockUser.id },
        body: updateData,
      } as unknown as Request;
      const res = mockResponse();
      const updatedUser = { ...mockUser, ...updateData };

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(UserModel, 'update').mockResolvedValue(updatedUser);

      // Call controller method
      await UserController.update(req, res);

      // Assertions
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(UserModel.update).toHaveBeenCalledWith(mockUser.id, updateData);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }));
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      // Setup
      const req = { params: { id: mockUser.id } } as unknown as Request;
      const res = mockResponse();

      // Mock UserModel methods
      jest.spyOn(UserModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(UserModel, 'delete').mockResolvedValue(undefined);

      // Call controller method
      await UserController.delete(req, res);

      // Assertions
      expect(UserModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(UserModel.delete).toHaveBeenCalledWith(mockUser.id);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });
  });
});
