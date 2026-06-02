/**
 * One-shot converter: rewrites seed JSON files so each dialogue content gets a
 * structured `dialogue_data` field (characters + lines).
 *
 * Convention:
 *  - Parse "Speaker: text" prefix from existing `vietnamese_text` / `translation`.
 *  - First unique speaker → side='left' (NPC default).
 *  - Second unique speaker → side='right' (the protagonist / learner).
 *  - Speakers 3+ → side='left' (additional NPCs).
 *  - Character ids: stable strings `c1`, `c2`, ... in order of appearance.
 *
 * Run: `bun run scripts/convert-dialogue-seeds.ts`
 */
import { promises as fs } from 'fs';
import * as path from 'path';

const SEED_DIR = path.resolve(__dirname, '../../.scratch/seed-data');
const FILES = [
  'seed-a1.json',
  'seed-a2.json',
  'seed-b1.json',
  'seed-b2.json',
  'seed-c1.json',
  'seed-c2.json',
  'seed-all.json',
];

interface DialogueCharacter {
  id: string;
  name: string;
  side: 'left' | 'right';
}
interface DialogueLine {
  characterId: string;
  vi: string;
  en?: string | null;
}
interface DialogueData {
  characters: DialogueCharacter[];
  lines: DialogueLine[];
}

function parseSpeakerLine(raw: string): { speaker: string; text: string } {
  const match = raw.match(/^([^:：]+)[:：]\s*(.*)$/);
  if (!match) return { speaker: '', text: raw.trim() };
  return { speaker: match[1].trim(), text: match[2].trim() };
}

function buildDialogueData(viText: string, enText: string | null): DialogueData {
  const viLines = viText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const enLines = (enText ?? '').split(/\r?\n/).map((l) => l.trim());

  const speakers: string[] = [];
  const lines: DialogueLine[] = [];

  for (let i = 0; i < viLines.length; i++) {
    const { speaker, text: vi } = parseSpeakerLine(viLines[i]);
    const enRaw = enLines[i] ?? '';
    const { text: en } = parseSpeakerLine(enRaw);

    if (speaker && !speakers.includes(speaker)) speakers.push(speaker);
    const characterId = speaker
      ? `c${speakers.indexOf(speaker) + 1}`
      : 'c0';

    lines.push({ characterId, vi, en: en || null });
  }

  // Fallback: if no speaker was parsed, add a default "Người nói" character.
  if (!speakers.length) speakers.push('Người nói');

  const characters: DialogueCharacter[] = speakers.map((name, idx) => ({
    id: `c${idx + 1}`,
    name,
    side: idx === 1 ? 'right' : 'left',
  }));

  // Patch lines that had no parsed speaker to point to the first character.
  for (const l of lines) {
    if (l.characterId === 'c0') l.characterId = characters[0].id;
  }

  return { characters, lines };
}

interface SeedContent {
  content_type: string;
  vietnamese_text?: string;
  translation?: string | null;
  dialogue_data?: DialogueData | null;
  [key: string]: unknown;
}

interface SeedLesson {
  lesson_contents?: SeedContent[];
  [key: string]: unknown;
}

interface SeedModule {
  lessons?: SeedLesson[];
  [key: string]: unknown;
}

interface SeedCourse {
  modules?: SeedModule[];
  [key: string]: unknown;
}

interface SeedRoot {
  courses?: SeedCourse[];
  [key: string]: unknown;
}

function convertSeed(root: SeedRoot): { converted: number } {
  let converted = 0;
  for (const course of root.courses ?? []) {
    for (const mod of course.modules ?? []) {
      for (const lesson of mod.lessons ?? []) {
        for (const content of lesson.lesson_contents ?? []) {
          if (content.content_type !== 'dialogue') continue;
          if (content.dialogue_data) continue; // skip already converted
          const data = buildDialogueData(
            content.vietnamese_text ?? '',
            content.translation ?? null,
          );
          content.dialogue_data = data;
          converted++;
        }
      }
    }
  }
  return { converted };
}

async function main() {
  for (const file of FILES) {
    const filePath = path.join(SEED_DIR, file);
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(raw) as SeedRoot;
      const { converted } = convertSeed(json);
      if (converted > 0) {
        await fs.writeFile(filePath, JSON.stringify(json, null, 2) + '\n', 'utf8');
        console.log(`✓ ${file}: converted ${converted} dialogue entries`);
      } else {
        console.log(`· ${file}: no dialogue entries to convert`);
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log(`× ${file}: not found, skipping`);
        continue;
      }
      throw err;
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
