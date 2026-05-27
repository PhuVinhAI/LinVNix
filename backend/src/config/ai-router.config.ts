import { registerAs } from '@nestjs/config';

function parseKeys(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function featureConfig(prefix: string) {
  return {
    provider: process.env[`${prefix}_PROVIDER`] || 'genai',
    baseUrl: process.env[`${prefix}_BASE_URL`] || '',
    apiKeys: parseKeys(process.env[`${prefix}_API_KEYS`]),
    model: process.env[`${prefix}_MODEL`] || '',
    fallbackModel: process.env[`${prefix}_FALLBACK_MODEL`] || '',
  };
}

export default registerAs('aiRouter', () => ({
  exercise: featureConfig('AI_EXERCISE'),
  simulation: featureConfig('AI_SIMULATION'),
  assistant: featureConfig('AI_ASSISTANT'),
}));
