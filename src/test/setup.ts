import type { PrismaClient } from '@prisma/client';

import { mockDeep, mockReset } from 'jest-mock-extended';

// Mock PrismaClient
export const prismaMock = mockDeep<PrismaClient>();

// Mock the @prisma/client module
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => prismaMock),
  };
});

// Also directly replace the singleton instance
jest.mock('../models/user-model', () => {
  const original = jest.requireActual('../models/user-model');
  // Create a new class that extends the original with mocked prisma
  const UserModelWithMockedPrisma = class extends original.UserModel {
    // Override methods that use prisma to use our mock
    static get prisma() {
      return prismaMock;
    }
  };

  return {
    ...original,
    UserModel: UserModelWithMockedPrisma,
    // Also replace the singleton
    PrismaClientSingleton: {
      getInstance: jest.fn().mockReturnValue(prismaMock),
    },
  };
});

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
  jest.clearAllMocks();
});
