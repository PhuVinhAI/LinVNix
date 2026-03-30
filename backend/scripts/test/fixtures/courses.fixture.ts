import { TestDataBuilder } from '../utils/test-data';

/**
 * Course fixtures for testing
 */
export const courseFixtures = {
  /**
   * Beginner course (A1)
   */
  beginnerCourse: {
    title: 'Vietnamese for Beginners',
    description: 'Learn basic Vietnamese from scratch',
    level: 'A1',
    orderIndex: 1,
    isPublished: true,
  },

  /**
   * Elementary course (A2)
   */
  elementaryCourse: {
    title: 'Elementary Vietnamese',
    description: 'Build on your basic Vietnamese knowledge',
    level: 'A2',
    orderIndex: 2,
    isPublished: true,
  },

  /**
   * Intermediate course (B1)
   */
  intermediateCourse: {
    title: 'Intermediate Vietnamese',
    description: 'Develop intermediate Vietnamese skills',
    level: 'B1',
    orderIndex: 3,
    isPublished: true,
  },

  /**
   * Generate random course
   */
  randomCourse: () => TestDataBuilder.course(),

  /**
   * Generate course with specific level
   */
  courseWithLevel: (level: string) =>
    TestDataBuilder.course({ level, orderIndex: 1 }),
};

/**
 * Unit fixtures for testing
 */
export const unitFixtures = {
  /**
   * First unit - Greetings
   */
  greetingsUnit: (courseId: string) => ({
    title: 'Greetings and Introductions',
    description: 'Learn how to greet people and introduce yourself',
    orderIndex: 1,
    courseId,
  }),

  /**
   * Second unit - Numbers
   */
  numbersUnit: (courseId: string) => ({
    title: 'Numbers and Counting',
    description: 'Learn Vietnamese numbers from 0 to 100',
    orderIndex: 2,
    courseId,
  }),

  /**
   * Third unit - Family
   */
  familyUnit: (courseId: string) => ({
    title: 'Family Members',
    description: 'Learn vocabulary about family relationships',
    orderIndex: 3,
    courseId,
  }),

  /**
   * Generate random unit
   */
  randomUnit: (courseId: string) => TestDataBuilder.unit(courseId),
};

/**
 * Lesson fixtures for testing
 */
export const lessonFixtures = {
  /**
   * Vocabulary lesson
   */
  vocabularyLesson: (unitId: string) => ({
    title: 'Basic Greetings Vocabulary',
    description: 'Learn essential greeting words',
    lessonType: 'vocabulary',
    orderIndex: 1,
    estimatedDuration: 15,
    unitId,
  }),

  /**
   * Grammar lesson
   */
  grammarLesson: (unitId: string) => ({
    title: 'Sentence Structure Basics',
    description: 'Learn basic Vietnamese sentence structure',
    lessonType: 'grammar',
    orderIndex: 2,
    estimatedDuration: 20,
    unitId,
  }),

  /**
   * Reading lesson
   */
  readingLesson: (unitId: string) => ({
    title: 'Reading Practice',
    description: 'Practice reading simple Vietnamese texts',
    lessonType: 'reading',
    orderIndex: 3,
    estimatedDuration: 25,
    unitId,
  }),

  /**
   * Listening lesson
   */
  listeningLesson: (unitId: string) => ({
    title: 'Listening Practice',
    description: 'Practice listening to Vietnamese conversations',
    lessonType: 'listening',
    orderIndex: 4,
    estimatedDuration: 20,
    unitId,
  }),

  /**
   * Generate random lesson
   */
  randomLesson: (unitId: string) => TestDataBuilder.lesson(unitId),
};
