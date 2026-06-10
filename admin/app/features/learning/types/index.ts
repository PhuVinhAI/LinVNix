export interface Course {
  id: string
  title: string
  description: string
  level: string
  orderIndex: number
  isPublished: boolean
  thumbnailUrl?: string | null
  estimatedHours?: number | null
  vietnameseLevelName?: string | null
  modules?: Module[]
  createdAt: string
  updatedAt: string
}

export interface Module {
  id: string
  title: string
  description: string
  orderIndex: number
  estimatedHours?: number | null
  courseId: string
  course?: Course
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  title: string
  description: string
  lessonType: string
  orderIndex: number
  estimatedDuration?: number | null
  moduleId: string
  module?: Module
  contents?: LessonContent[]
  vocabularies?: Vocabulary[]
  grammarRules?: GrammarRule[]
  exercises?: Exercise[]
}

/**
 * LessonContent — schema gửi xuống admin từ backend.
 * Mỗi loại có payload riêng (xem 4 interface dưới); preview gồm
 * vietnameseText/translation do backend tự sinh, dùng cho list/search.
 */
export interface LessonContent {
  id: string
  contentType: 'text' | 'image' | 'audio' | 'video' | 'dialogue'
  vietnameseText: string
  translation?: string | null
  orderIndex: number
  notes?: string | null
  lessonId: string
  /** Khi contentType khác 'dialogue' — payload theo loại. */
  payload?: LessonContentPayload | null
  /** Chỉ dùng cho dialogue. */
  dialogueData?: DialogueData | null
}

export type LessonContentPayload =
  | TextContentPayload
  | ImageContentPayload
  | AudioContentPayload
  | VideoContentPayload

export type ImageAspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto'
export type VideoAspectRatio = '16:9' | '9:16' | '4:3' | '1:1'
export type VideoProvider = 'self_hosted' | 'youtube'

export interface TextContentPayload {
  body: string
  translation?: string | null
  paragraphs?: Array<{ vi: string; en?: string | null }>
  keyTerms?: Array<{ term: string; meaning: string }>
}

export interface ImageContentPayload {
  url: string
  caption: string
  captionEn?: string | null
  altText?: string | null
  aspectRatio?: ImageAspectRatio
  source?: string | null
}

export interface AudioContentPayload {
  url: string
  title: string
  durationSeconds?: number | null
  speaker?: string | null
  coverImageUrl?: string | null
  transcript: string
  translation?: string | null
  segments?: Array<{ startSeconds: number; vi: string; en?: string | null }>
}

export interface VideoContentPayload {
  url: string
  title: string
  durationSeconds?: number | null
  thumbnailUrl?: string | null
  aspectRatio?: VideoAspectRatio
  provider?: VideoProvider
  transcript?: string | null
  translation?: string | null
  chapters?: Array<{ startSeconds: number; title: string }>
}

export type DialogueSide = 'left' | 'right'

export interface DialogueCharacter {
  id: string
  name: string
  side: DialogueSide
}

export interface DialogueLine {
  characterId: string
  vi: string
  en?: string | null
  audio?: string | null
}

export interface DialogueData {
  characters: DialogueCharacter[]
  lines: DialogueLine[]
}

export interface Vocabulary {
  id: string
  word: string
  translation: string
  partOfSpeech: string
  exampleSentence?: string | null
  exampleTranslation?: string | null
  audioUrl?: string | null
  imageUrl?: string | null
  classifier?: string | null
  dialectVariants?: Record<string, string> | null
  audioUrls?: Record<string, string> | null
  region?: string | null
  difficultyLevel: number
  orderIndex: number
  lessonId: string
}

export interface GrammarRule {
  id: string
  title: string
  explanation: string
  structure?: string | null
  examples: Array<{ vi: string; en: string; note?: string }>
  notes?: string | null
  difficultyLevel: number
  orderIndex: number
  lessonId: string
}

export interface Exercise {
  id: string
  lessonId?: string | null
  lesson?: Lesson | null
  title: string
  description?: string | null
  isCustom: boolean
  isAIGenerated: boolean
  orderIndex: number
  questions?: Question[]
}

export interface Question {
  id: string
  questionType: string
  question?: string | null
  questionAudioUrl?: string | null
  options?: unknown
  correctAnswer: unknown
  explanation?: string | null
  orderIndex: number
  difficultyLevel: number
  exerciseId: string
}
