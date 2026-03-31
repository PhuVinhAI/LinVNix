import { runVocabularyEnhancementsTests } from './suites/vocabulary-enhancements.test';

async function main() {
  console.log('🚀 Starting Vocabulary Enhancements Test Suite\n');
  console.log('Testing:');
  console.log('  - Dictionary Search API');
  console.log('  - Batch Review API');
  console.log('  - Admin Dashboard API\n');

  try {
    await runVocabularyEnhancementsTests();
    console.log('✅ All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Tests failed');
    process.exit(1);
  }
}

main();
