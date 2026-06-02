export type DialogueSide = 'left' | 'right';

export interface DialogueCharacter {
  id: string;
  name: string;
  side: DialogueSide;
}

export interface DialogueLine {
  characterId: string;
  vi: string;
  en?: string | null;
  audio?: string | null;
}

export interface DialogueData {
  characters: DialogueCharacter[];
  lines: DialogueLine[];
}
