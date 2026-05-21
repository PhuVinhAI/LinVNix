/**
 * Integration test suite for the Simulation Database Seeder.
 *
 * Run from `backend/`:
 *
 *   bun run db:up
 *   bun run test:integration:simulations-seed
 */

import { bootstrapAppContext, AppContext } from './helpers/app-context';
import { describe, it, expect, runRegisteredTests } from './helpers/test-runner';
import { seedSimulations } from '../../seed-simulations';
import { ScenarioCategory } from '../../../src/modules/simulations/domain/scenario-category.entity';
import { Scenario } from '../../../src/modules/simulations/domain/scenario.entity';
import { ScenarioCharacter } from '../../../src/modules/simulations/domain/scenario-character.entity';

let ctx: AppContext;

async function setup(): Promise<void> {
  ctx = await bootstrapAppContext();
}

async function teardown(): Promise<void> {
  if (ctx) {
    await ctx.close();
  }
}

describe('Simulations Database Seeder Integration Tests', () => {
  it('successfully seeds 6 categories and exactly 15 scenarios', async () => {
    const categoryRepo = ctx.dataSource.getRepository(ScenarioCategory);
    const scenarioRepo = ctx.dataSource.getRepository(Scenario);

    // 1. Run seeder
    await seedSimulations(ctx.dataSource);

    // 2. Verify categories count
    const categories = await categoryRepo.find({ order: { orderIndex: 'ASC' } });
    expect(categories.length).toBe(6);

    const categoryNames = categories.map(c => c.name);
    expect(categoryNames).toEqual([
      'Mua sắm',
      'Ăn uống',
      'Di chuyển',
      'Y tế',
      'Công việc',
      'Đời sống'
    ]);

    // 3. Verify scenarios count
    const scenarios = await scenarioRepo.find({ relations: ['characters'] });
    expect(scenarios.length).toBe(15);

    // 4. Verify properties of each scenario
    for (const scenario of scenarios) {
      // 4a. Verify characters
      expect(scenario.characters.length >= 2).toBeTruthy();
      
      const playableCharacters = scenario.characters.filter(c => c.isPlayable);
      expect(playableCharacters.length >= 1).toBeTruthy();

      // 4b. Verify scoring criteria weights sum to exactly 100
      expect(Array.isArray(scenario.scoringCriteria)).toBeTruthy();
      expect(scenario.scoringCriteria.length >= 3).toBeTruthy();
      expect(scenario.scoringCriteria.length <= 5).toBeTruthy();

      let totalWeight = 0;
      for (const criteria of scenario.scoringCriteria) {
        expect(typeof criteria.name).toBe('string');
        expect(typeof criteria.weight).toBe('number');
        totalWeight += criteria.weight;
      }
      expect(totalWeight).toBe(100);

      // 4c. Verify system prompt template contains Handlebars variables
      expect(scenario.systemPrompt.includes('{{')).toBeTruthy();
    }
  });

  it('runs idempotently without duplicating or throwing', async () => {
    const categoryRepo = ctx.dataSource.getRepository(ScenarioCategory);
    const scenarioRepo = ctx.dataSource.getRepository(Scenario);
    const characterRepo = ctx.dataSource.getRepository(ScenarioCharacter);

    // Save initial counts after first run
    const initialCategoriesCount = await categoryRepo.count();
    const initialScenariosCount = await scenarioRepo.count();
    const initialCharactersCount = await characterRepo.count();

    // Run a second time
    await seedSimulations(ctx.dataSource);

    // Verify counts remain identical
    const categoriesCount = await categoryRepo.count();
    expect(categoriesCount).toBe(initialCategoriesCount);

    const scenariosCount = await scenarioRepo.count();
    expect(scenariosCount).toBe(initialScenariosCount);

    const totalCharacters = await characterRepo.count();
    expect(totalCharacters).toBe(initialCharactersCount);
  });
});

await setup();
let allPassed = false;
try {
  allPassed = await runRegisteredTests('Simulations Seeder integration suite');
} finally {
  await teardown();
}
// Force-exit because Bull/Redis workers in QueueModule don't unref on close
process.exit(allPassed ? 0 : 1);
