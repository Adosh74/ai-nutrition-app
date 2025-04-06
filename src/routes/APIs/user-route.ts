import { Router } from 'express';

import { UserController } from '../../controllers/user-controller';
import { validateRequest } from '../../middlewares/validate-request';

const router = Router();

// Register new user
router.post(
  '/',
  UserController.registerValidation,
  validateRequest,
  UserController.register,
);

// Get all users
router.get('/', UserController.getAll);

// Get user by ID
router.get(
  '/:id',
  UserController.idParamValidation,
  validateRequest,
  UserController.getById,
);

// Update user
router.put(
  '/:id',
  UserController.updateValidation,
  validateRequest,
  UserController.update,
);

// Delete user
router.delete(
  '/:id',
  UserController.idParamValidation,
  validateRequest,
  UserController.delete,
);

export { router as userRouter };
