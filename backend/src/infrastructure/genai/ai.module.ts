import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KeyPool } from '../ai/key-pool';
import { GenaiProvider } from './genai-provider';
import { isGenaiRateLimitError, getGenaiCooldownMs } from './genai-errors';

export const AI_PROVIDER = 'AI_PROVIDER';

@Global()
@Module({
  providers: [
    {
      provide: KeyPool,
      useFactory: (configService: ConfigService) => {
        const genaiConfig = configService.get<{
          apiKey: string;
          apiKeys: string[];
        }>('genai')!;
        const keys =
          genaiConfig.apiKeys.length > 0
            ? genaiConfig.apiKeys
            : genaiConfig.apiKey
              ? [genaiConfig.apiKey]
              : [];
        return new KeyPool({
          keys,
          isRateLimitError: isGenaiRateLimitError,
          getCooldownMs: getGenaiCooldownMs,
        });
      },
      inject: [ConfigService],
    },
    GenaiProvider,
    {
      provide: AI_PROVIDER,
      useExisting: GenaiProvider,
    },
  ],
  exports: [KeyPool, GenaiProvider, AI_PROVIDER],
})
export class AiModule {}
