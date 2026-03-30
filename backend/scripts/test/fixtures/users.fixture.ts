import { TestDataBuilder } from '../utils/test-data';

/**
 * User fixtures for testing
 */
export const userFixtures = {
  /**
   * Regular test user
   */
  testUser: {
    email: 'test.user@linvnix.test',
    password: 'Test123456',
    fullName: 'Test User',
    nativeLanguage: 'English',
    currentLevel: 'A1',
  },

  /**
   * Admin user
   */
  adminUser: {
    email: 'admin@linvnix.test',
    password: 'Admin123456',
    fullName: 'Admin User',
    nativeLanguage: 'English',
    currentLevel: 'C2',
  },

  /**
   * Beginner user (A1)
   */
  beginnerUser: {
    email: 'beginner@linvnix.test',
    password: 'Test123456',
    fullName: 'Beginner User',
    nativeLanguage: 'English',
    currentLevel: 'A1',
  },

  /**
   * Intermediate user (B1)
   */
  intermediateUser: {
    email: 'intermediate@linvnix.test',
    password: 'Test123456',
    fullName: 'Intermediate User',
    nativeLanguage: 'English',
    currentLevel: 'B1',
  },

  /**
   * Advanced user (C1)
   */
  advancedUser: {
    email: 'advanced@linvnix.test',
    password: 'Test123456',
    fullName: 'Advanced User',
    nativeLanguage: 'English',
    currentLevel: 'C1',
  },

  /**
   * Generate random user
   */
  randomUser: () => TestDataBuilder.user(),

  /**
   * Generate user with specific level
   */
  userWithLevel: (level: string) =>
    TestDataBuilder.user({ currentLevel: level }),
};
