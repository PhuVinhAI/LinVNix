import { v4 as uuidv4 } from 'uuid';

export class TestDataBuilder {
  /**
   * Generate unique email
   */
  static generateEmail(prefix: string = 'test'): string {
    return `${prefix}-${uuidv4()}@linvnix.test`;
  }

  /**
   * Generate random string
   */
  static randomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, length + 2);
  }

  /**
   * Generate user data
   */
  static user(overrides?: any) {
    return {
      email: this.generateEmail(),
      password: 'Test123456',
      fullName: `Test User ${this.randomString(5)}`,
      nativeLanguage: 'English',
      currentLevel: 'A1',
      ...overrides,
    };
  }

  /**
   * Generate course data
   */
  static course(overrides?: any) {
    return {
      title: `Course ${this.randomString(5)}`,
      description: `Test course description ${this.randomString(10)}`,
      level: 'A1',
      orderIndex: 1,
      isPublished: true,
      ...overrides,
    };
  }

  /**
   * Generate unit data
   */
  static unit(courseId: string, overrides?: any) {
    return {
      title: `Unit ${this.randomString(5)}`,
      description: `Test unit description ${this.randomString(10)}`,
      orderIndex: 1,
      courseId,
      ...overrides,
    };
  }

  /**
   * Generate lesson data
   */
  static lesson(unitId: string, overrides?: any) {
    return {
      title: `Lesson ${this.randomString(5)}`,
      description: `Test lesson description ${this.randomString(10)}`,
      lessonType: 'vocabulary',
      orderIndex: 1,
      estimatedDuration: 30,
      unitId,
      ...overrides,
    };
  }

  /**
   * Generate vocabulary data
   */
  static vocabulary(lessonId: string, overrides?: any) {
    return {
      word: `từ ${this.randomString(5)}`,
      translation: `word ${this.randomString(5)}`,
      phonetic: `tu ${this.randomString(5)}`,
      partOfSpeech: 'noun',
      exampleSentence: `Example sentence with ${this.randomString(5)}`,
      exampleTranslation: `Example translation with ${this.randomString(5)}`,
      difficultyLevel: 1,
      lessonId,
      ...overrides,
    };
  }

  /**
   * Generate exercise data
   */
  static exercise(lessonId: string, overrides?: any) {
    return {
      exerciseType: 'multiple_choice',
      question: `Question ${this.randomString(10)}?`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 'Option A',
      explanation: `Explanation ${this.randomString(10)}`,
      orderIndex: 1,
      difficultyLevel: 1,
      lessonId,
      ...overrides,
    };
  }

  /**
   * Generate grammar rule data
   */
  static grammarRule(lessonId: string, overrides?: any) {
    return {
      title: `Grammar Rule ${this.randomString(5)}`,
      explanation: `Explanation ${this.randomString(20)}`,
      structure: 'Subject + Verb + Object',
      examples: [
        { vi: 'Tôi ăn cơm', en: 'I eat rice' },
        { vi: 'Bạn học tiếng Việt', en: 'You learn Vietnamese' },
      ],
      notes: `Notes ${this.randomString(10)}`,
      difficultyLevel: 1,
      lessonId,
      ...overrides,
    };
  }
}
