#!/usr/bin/env bun

import { runAuthScenario } from './scenarios/01-auth.scenario';
import { runLearningScenario } from './scenarios/02-learning.scenario';
import { runProgressScenario } from './scenarios/03-progress.scenario';

/**
 * Run all test scenarios
 */
async function runAllScenarios() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                            ║');
  console.log('║        LinVNix Backend - Integration Scenarios             ║');
  console.log('║                                                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n🎬 Starting end-to-end scenarios...\n');

  const startTime = Date.now();
  let passedScenarios = 0;
  let failedScenarios = 0;
  const results: { scenario: string; status: string; error?: any }[] = [];

  // Scenarios to run
  const scenarios = [
    { name: 'Authentication Flow', fn: runAuthScenario },
    { name: 'Learning Flow', fn: runLearningScenario },
    { name: 'Progress Tracking', fn: runProgressScenario },
  ];

  // Run each scenario
  for (const scenario of scenarios) {
    try {
      await scenario.fn();
      passedScenarios++;
      results.push({ scenario: scenario.name, status: '✅ PASSED' });
    } catch (error) {
      failedScenarios++;
      results.push({ scenario: scenario.name, status: '❌ FAILED', error });
      console.error(`\n❌ ${scenario.name} scenario failed:`, error);
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    SCENARIO SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  results.forEach((result) => {
    console.log(`  ${result.status} ${result.scenario}`);
  });

  console.log('\n' + '─'.repeat(60));
  console.log(`  Total Scenarios: ${scenarios.length}`);
  console.log(`  Passed: ${passedScenarios}`);
  console.log(`  Failed: ${failedScenarios}`);
  console.log(`  Duration: ${duration}s`);
  console.log('─'.repeat(60) + '\n');

  if (failedScenarios > 0) {
    console.log('❌ Some scenarios failed. Please check the errors above.\n');
    process.exit(1);
  } else {
    console.log('✅ All scenarios passed successfully!\n');
    console.log('🎉 Your backend is working perfectly!\n');
    process.exit(0);
  }
}

// Run all scenarios
runAllScenarios().catch((error) => {
  console.error('Fatal error running scenarios:', error);
  process.exit(1);
});
