import { AiProviderRouter } from './ai-provider-router';
import { GenaiProvider } from '../genai/genai-provider';
import { OpenaiProvider } from '../openai/openai.provider';
import { ConfigService } from '@nestjs/config';

function makeRouter(
  featureConfigs: Record<string, Partial<Record<string, any>>> = {},
): AiProviderRouter {
  const defaults = {
    exercise: {
      provider: 'genai',
      baseUrl: '',
      apiKeys: [],
      model: '',
      fallbackModel: '',
    },
    simulation: {
      provider: 'genai',
      baseUrl: '',
      apiKeys: [],
      model: '',
      fallbackModel: '',
    },
    assistant: {
      provider: 'genai',
      baseUrl: '',
      apiKeys: [],
      model: '',
      fallbackModel: '',
    },
  };
  const merged = {
    exercise: { ...defaults.exercise, ...(featureConfigs['exercise'] ?? {}) },
    simulation: {
      ...defaults.simulation,
      ...(featureConfigs['simulation'] ?? {}),
    },
    assistant: {
      ...defaults.assistant,
      ...(featureConfigs['assistant'] ?? {}),
    },
  };

  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'aiRouter.exercise') return merged.exercise;
      if (key === 'aiRouter.simulation') return merged.simulation;
      if (key === 'aiRouter.assistant') return merged.assistant;
      return undefined;
    }),
  } as unknown as ConfigService;

  const genaiProvider = { renderPrompt: jest.fn() } as unknown as GenaiProvider;
  return new AiProviderRouter(genaiProvider, configService);
}

describe('AiProviderRouter', () => {
  describe('forFeature - default genai', () => {
    it('returns injected GenaiProvider when no per-feature config set', () => {
      const router = makeRouter();
      const genai = (router as any).genaiProvider as GenaiProvider;

      router.onModuleInit();
      const provider = router.forFeature('exercise');

      expect(provider).toBe(genai);
    });
  });

  describe('forFeature - openai provider', () => {
    it('returns OpenaiProvider instance when provider=openai with valid config', () => {
      const router = makeRouter({
        exercise: {
          provider: 'openai',
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKeys: ['sk-key1'],
          model: 'claude-3-haiku',
          fallbackModel: '',
        },
      });

      router.onModuleInit();
      const provider = router.forFeature('exercise');

      expect(provider).toBeInstanceOf(OpenaiProvider);
    });

    it('caches provider — two calls return same instance', () => {
      const router = makeRouter({
        exercise: {
          provider: 'openai',
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKeys: ['sk-key1'],
          model: 'claude-3-haiku',
          fallbackModel: '',
        },
      });

      router.onModuleInit();
      const first = router.forFeature('exercise');
      const second = router.forFeature('exercise');

      expect(first).toBe(second);
    });

    it('returns different instances for different features', () => {
      const openaiConfig = {
        provider: 'openai',
        baseUrl: 'https://openrouter.ai/api/v1',
        apiKeys: ['sk-key1'],
        model: 'claude-3-haiku',
        fallbackModel: '',
      };
      const router = makeRouter({
        exercise: openaiConfig,
        simulation: openaiConfig,
      });

      router.onModuleInit();
      const exerciseProvider = router.forFeature('exercise');
      const simulationProvider = router.forFeature('simulation');

      expect(exerciseProvider).not.toBe(simulationProvider);
      expect(exerciseProvider).toBeInstanceOf(OpenaiProvider);
      expect(simulationProvider).toBeInstanceOf(OpenaiProvider);
    });
  });

  describe('startup validation', () => {
    it('throws when provider=openai but BASE_URL is missing', () => {
      const router = makeRouter({
        exercise: {
          provider: 'openai',
          baseUrl: '',
          apiKeys: ['sk-key1'],
          model: 'some-model',
          fallbackModel: '',
        },
      });

      expect(() => router.onModuleInit()).toThrow(
        /AI_EXERCISE_PROVIDER=openai requires/,
      );
    });

    it('throws when provider=openai but API_KEYS is empty', () => {
      const router = makeRouter({
        exercise: {
          provider: 'openai',
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKeys: [],
          model: 'some-model',
          fallbackModel: '',
        },
      });

      expect(() => router.onModuleInit()).toThrow(
        /AI_EXERCISE_PROVIDER=openai requires/,
      );
    });

    it('throws for simulation feature with missing config', () => {
      const router = makeRouter({
        simulation: {
          provider: 'openai',
          baseUrl: '',
          apiKeys: [],
          model: '',
          fallbackModel: '',
        },
      });

      expect(() => router.onModuleInit()).toThrow(
        /AI_SIMULATION_PROVIDER=openai requires/,
      );
    });

    it('does not throw when all features use default genai provider', () => {
      const router = makeRouter();
      expect(() => router.onModuleInit()).not.toThrow();
    });
  });

  describe('renderPrompt delegation', () => {
    it('delegates renderPrompt to GenaiProvider', () => {
      const router = makeRouter();
      const genai = (router as any).genaiProvider as jest.Mocked<GenaiProvider>;
      (genai.renderPrompt as jest.Mock).mockReturnValue('rendered');

      const result = router.renderPrompt('some-template', { key: 'value' });

      expect(genai.renderPrompt).toHaveBeenCalledWith('some-template', {
        key: 'value',
      });
      expect(result).toBe('rendered');
    });
  });
});
