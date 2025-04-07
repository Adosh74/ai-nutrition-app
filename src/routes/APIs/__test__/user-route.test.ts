import request from 'supertest';

import { app } from '../../../app';
import { UserController } from '../../../controllers/user-controller';

// Mock UserController methods
jest.mock('../../../controllers/user-controller', () => {
  const original = jest.requireActual('../../../controllers/user-controller');
  return {
    ...original,
    UserController: {
      ...original.UserController,
      register: jest.fn(),
      login: jest.fn(),
      getById: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      // Keep the validation arrays from the original
      registerValidation: original.UserController.registerValidation,
      loginValidation: original.UserController.loginValidation,
      idParamValidation: original.UserController.idParamValidation,
      updateValidation: original.UserController.updateValidation,
    },
  };
});

describe('user Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    name: 'Test User',
    phone: '1234567890',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Update all route paths to match your app structure
  const baseUrl = '/api/v1/users';

  describe('pOST /api/v1/users/register', () => {
    const validUserData = {
      email: 'test@example.com',
      name: 'Test User',
      phone: '1234567890',
      password: 'password123',
    };

    it('should register a new user with valid data', async () => {
      // Mock successful registration
      (UserController.register as jest.Mock).mockImplementation((req, res) => {
        res.status(201).send({ ...mockUser });
      });

      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(validUserData);

      expect(response.status).toBe(201);
      expect(UserController.register).toHaveBeenCalled();
      expect(response.body).toHaveProperty('id');
    });

    it('should return validation errors for invalid data', async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({
          email: 'not-an-email',
          name: '',
          password: '123', // too short
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(UserController.register).not.toHaveBeenCalled();
    });
  });

  describe('pOST /api/v1/users/login', () => {
    it('should login a user with valid credentials', async () => {
      // Mock successful login
      (UserController.login as jest.Mock).mockImplementation((req, res) => {
        res.status(200).send({ ...mockUser });
      });

      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(UserController.login).toHaveBeenCalled();
      expect(response.body).toHaveProperty('id');
    });

    it('should return validation errors for invalid login data', async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send({
          email: 'not-an-email',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(UserController.login).not.toHaveBeenCalled();
    });
  });

  describe('gET /api/v1/users', () => {
    it('should return all users', async () => {
      // Mock getting all users
      (UserController.getAll as jest.Mock).mockImplementation((req, res) => {
        res.status(200).send([mockUser, { ...mockUser, id: '223e4567-e89b-12d3-a456-426614174000' }]);
      });

      const response = await request(app).get(baseUrl);

      expect(response.status).toBe(200);
      expect(UserController.getAll).toHaveBeenCalled();
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('gET /api/v1/users/:id', () => {
    it('should return a user by ID', async () => {
      // Mock getting user by ID
      (UserController.getById as jest.Mock).mockImplementation((req, res) => {
        res.status(200).send(mockUser);
      });

      const response = await request(app)
        .get(`${baseUrl}/${mockUser.id}`);

      expect(response.status).toBe(200);
      expect(UserController.getById).toHaveBeenCalled();
      expect(response.body).toHaveProperty('id', mockUser.id);
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get(`${baseUrl}/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(UserController.getById).not.toHaveBeenCalled();
    });
  });

  describe('pUT /api/v1/users/:id', () => {
    it('should update a user with valid data', async () => {
      // Mock updating user
      (UserController.update as jest.Mock).mockImplementation((req, res) => {
        res.status(200).send({ ...mockUser, name: 'Updated Name' });
      });

      const response = await request(app)
        .put(`${baseUrl}/${mockUser.id}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(UserController.update).toHaveBeenCalled();
      expect(response.body).toHaveProperty('name', 'Updated Name');
    });

    it('should validate UUID format and update data', async () => {
      const response = await request(app)
        .put(`${baseUrl}/invalid-uuid`)
        .send({ email: 'not-an-email' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(UserController.update).not.toHaveBeenCalled();
    });
  });

  describe('dELETE /api/v1/users/:id', () => {
    it('should delete a user', async () => {
      // Mock deleting user
      (UserController.delete as jest.Mock).mockImplementation((req, res) => {
        res.status(204).send();
      });

      const response = await request(app)
        .delete(`${baseUrl}/${mockUser.id}`);

      expect(response.status).toBe(204);
      expect(UserController.delete).toHaveBeenCalled();
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .delete(`${baseUrl}/invalid-uuid`);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
      expect(UserController.delete).not.toHaveBeenCalled();
    });
  });
});
