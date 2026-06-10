import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoursesRepository } from './repositories/courses.repository';
import { ModulesRepository } from './repositories/modules.repository';
import {
  LessonsRepository,
  LessonFilterOptions,
} from './repositories/lessons.repository';
import { ContentsRepository } from '../../contents/application/contents.repository';
import {
  GrammarRepository,
  GrammarSearchOptions,
} from '../../grammar/application/grammar.repository';
import { ProgressRepository } from '../../progress/application/progress.repository';
import { ModuleProgressRepository } from '../../progress/application/module-progress.repository';
import { CourseProgressRepository } from '../../progress/application/course-progress.repository';
import { ProgressStatus } from '../../../common/enums';
import { Course } from '../domain/course.entity';
import { Module } from '../domain/module.entity';
import { Lesson } from '../domain/lesson.entity';
import { ContentType, LessonType, UserLevel } from '../../../common/enums';
import { ReorderItem } from '../../../common/utils/bulk-reorder';
import { LessonContent } from '../../contents/domain/lesson-content.entity';
import { DialogueData } from '../../contents/domain/dialogue-data.types';
import type {
  AudioContentPayload,
  ImageContentPayload,
  LessonContentPayload,
  TextContentPayload,
  VideoContentPayload,
} from '../../contents/domain/lesson-content-payload.types';
import { GrammarRule } from '../../grammar/domain/grammar-rule.entity';
import {
  CourseStatsPort,
  CourseStatsResult,
} from '../../admin/application/ports/dashboard-stats.ports';

/**
 * Lightweight catalog-lookup summary returned by `findLessons`. Intentionally
 * excludes full lesson content (contents, vocabularies, grammar rules) — the
 * AI fetches those via `get_lesson_detail` once it has narrowed to one
 * lesson the learner cares about.
 */
export interface LessonSummary {
  id: string;
  title: string;
  level: UserLevel;
  type: LessonType;
  courseTitle: string;
  moduleTitle: string;
}

/**
 * Input shape khi soạn nội dung — payload là object thô (chưa typed),
 * service sẽ validate + chuẩn hoá theo content_type rồi mới ghi xuống DB.
 * Tách riêng khỏi `Partial<LessonContent>` để DTO không phải khớp với union.
 */
export interface CreateContentInput {
  lessonId: string;
  contentType: ContentType;
  orderIndex: number;
  notes?: string | null;
  payload?: Record<string, unknown> | null;
  dialogueData?: DialogueData | null;
}

export type UpdateContentInput = Partial<CreateContentInput>;

@Injectable()
export class CourseContentService implements CourseStatsPort {
  constructor(
    private readonly coursesRepository: CoursesRepository,
    private readonly modulesRepository: ModulesRepository,
    private readonly lessonsRepository: LessonsRepository,
    private readonly contentsRepository: ContentsRepository,
    private readonly grammarRepository: GrammarRepository,
    private readonly progressRepository: ProgressRepository,
    private readonly moduleProgressRepository: ModuleProgressRepository,
    private readonly courseProgressRepository: CourseProgressRepository,
  ) {}

  async getTopCoursesByEnrollment(limit: number): Promise<CourseStatsResult[]> {
    return this.progressRepository.getTopCoursesByEnrollment(limit);
  }

  async getCourseStructure(courseId: string): Promise<Course> {
    const course = await this.coursesRepository.findById(courseId);
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    return course;
  }

  async getModuleDetail(moduleId: string): Promise<Module> {
    const module = await this.modulesRepository.findById(moduleId);
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    module.lessons = await this.lessonsRepository.findByModuleId(moduleId);
    return module;
  }

  async getLessonDetail(lessonId: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findById(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
    }
    lesson.contents = await this.contentsRepository.findByLessonId(lessonId);
    lesson.grammarRules = await this.grammarRepository.findByLessonId(lessonId);
    return lesson;
  }

  async getModulesByCourse(courseId: string): Promise<Module[]> {
    return this.modulesRepository.findByCourseId(courseId);
  }

  async getLessonsByModule(moduleId: string): Promise<Lesson[]> {
    return this.lessonsRepository.findByModuleId(moduleId);
  }

  /**
   * Catalog-level lesson search used by the `find_lessons` AI tool. Returns
   * compact summaries (not full lesson bodies); the AI follows up with
   * `get_lesson_detail` when it needs content.
   */
  async findLessons(opts: LessonFilterOptions = {}): Promise<LessonSummary[]> {
    const filter: LessonFilterOptions = {};
    if (opts.topic !== undefined) filter.topic = opts.topic;
    if (opts.level !== undefined) filter.level = opts.level;
    if (opts.type !== undefined) filter.type = opts.type;
    if (opts.limit !== undefined) filter.limit = opts.limit;

    const lessons = await this.lessonsRepository.findByFilter(filter);
    return lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      level: lesson.module?.course?.level,
      type: lesson.lessonType,
      courseTitle: lesson.module?.course?.title,
      moduleTitle: lesson.module?.title,
    }));
  }

  async getContentsByLesson(lessonId: string): Promise<LessonContent[]> {
    return this.contentsRepository.findByLessonId(lessonId);
  }

  async getContentDetail(contentId: string): Promise<LessonContent> {
    const content = await this.contentsRepository.findById(contentId);
    if (!content) {
      throw new NotFoundException(`Content with ID ${contentId} not found`);
    }
    return content;
  }

  async getGrammarByLesson(lessonId: string): Promise<GrammarRule[]> {
    return this.grammarRepository.findByLessonId(lessonId);
  }

  /**
   * Catalog-level grammar search used by the `search_grammar_rules` AI tool.
   * Empty / whitespace queries short-circuit without touching the DB.
   */
  async searchGrammar(
    query: string,
    opts: GrammarSearchOptions = {},
  ): Promise<GrammarRule[]> {
    const q = query?.trim() ?? '';
    if (q.length === 0) {
      return [];
    }
    return this.grammarRepository.search(q, opts);
  }

  async getGrammarDetail(grammarId: string): Promise<GrammarRule> {
    const grammar = await this.grammarRepository.findById(grammarId);
    if (!grammar) {
      throw new NotFoundException(
        `Grammar rule with ID ${grammarId} not found`,
      );
    }
    return grammar;
  }

  async createModule(data: Partial<Module>): Promise<Module> {
    const module = await this.modulesRepository.create(data);
    if (data.courseId) {
      await this.invalidateCourseProgress(data.courseId);
    }
    return module;
  }

  async updateModule(id: string, data: Partial<Module>): Promise<Module> {
    await this.findModuleById(id);
    return this.modulesRepository.update(id, data);
  }

  async deleteModule(id: string): Promise<void> {
    await this.findModuleById(id);
    await this.modulesRepository.delete(id);
  }

  async createLesson(data: Partial<Lesson>): Promise<Lesson> {
    const lesson = await this.lessonsRepository.create(data);
    if (data.moduleId) {
      await this.invalidateModuleProgress(data.moduleId);
    }
    return lesson;
  }

  async updateLesson(id: string, data: Partial<Lesson>): Promise<Lesson> {
    await this.findLessonById(id);
    return this.lessonsRepository.update(id, data);
  }

  async deleteLesson(id: string): Promise<void> {
    await this.findLessonById(id);
    await this.lessonsRepository.delete(id);
  }

  async reorderModules(items: ReorderItem[]): Promise<void> {
    await this.modulesRepository.reorder(items);
  }

  async reorderLessons(items: ReorderItem[]): Promise<void> {
    await this.lessonsRepository.reorder(items);
  }

  async reorderContents(items: ReorderItem[]): Promise<void> {
    await this.contentsRepository.reorder(items);
  }

  async reorderGrammarRules(items: ReorderItem[]): Promise<void> {
    await this.grammarRepository.reorder(items);
  }

  async createContent(data: CreateContentInput): Promise<LessonContent> {
    return this.contentsRepository.create(this.prepareContentPayload(data));
  }

  async updateContent(
    id: string,
    data: UpdateContentInput,
  ): Promise<LessonContent> {
    const existing = await this.findContentById(id);
    const effectiveType = data.contentType ?? existing.contentType;
    const effectiveDialogue =
      data.dialogueData !== undefined ? data.dialogueData : existing.dialogueData;
    const effectivePayload =
      data.payload !== undefined
        ? data.payload
        : (existing.payload as Record<string, unknown> | null | undefined);
    const merged: UpdateContentInput = {
      ...data,
      contentType: effectiveType,
      dialogueData: effectiveDialogue,
      payload: effectivePayload,
    };
    return this.contentsRepository.update(id, this.prepareContentPayload(merged));
  }

  async deleteContent(id: string): Promise<void> {
    await this.findContentById(id);
    await this.contentsRepository.delete(id);
  }

  /**
   * Chuẩn hoá payload theo content_type — validate cấu trúc + derive bản preview
   * (vietnameseText/translation) để list/search dùng được mà không phải đào jsonb.
   *
   * Quy ước:
   * - dialogue → dùng dialogueData (giữ schema cũ).
   * - text/image/audio/video → bắt buộc có payload đúng schema; clear dialogueData.
   */
  private prepareContentPayload(
    data: UpdateContentInput,
  ): Partial<LessonContent> {
    if (data.contentType === ContentType.DIALOGUE) {
      const dialogue = data.dialogueData;
      if (!dialogue) {
        throw new BadRequestException(
          'Hội thoại cần có dialogueData (characters + lines).',
        );
      }
      this.validateDialogue(dialogue);
      const { vi, en } = this.deriveDialogueText(dialogue);
      return {
        ...data,
        dialogueData: dialogue,
        payload: null,
        vietnameseText: vi,
        translation: en ?? null,
      };
    }

    // Các loại có payload — validate riêng và derive preview.
    const payload = data.payload as Record<string, unknown> | null | undefined;
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException(
        `Nội dung loại ${String(data.contentType)} cần payload tương ứng.`,
      );
    }

    const normalized = this.validateAndNormalizePayload(
      data.contentType as ContentType,
      payload,
    );
    const preview = this.derivePreview(
      data.contentType as ContentType,
      normalized,
    );

    return {
      ...data,
      payload: normalized,
      dialogueData: null,
      vietnameseText: preview.vi,
      translation: preview.en,
    };
  }

  private validateAndNormalizePayload(
    type: ContentType,
    raw: Record<string, unknown>,
  ): LessonContentPayload {
    switch (type) {
      case ContentType.TEXT: {
        const body = this.requireString(raw.body, 'payload.body');
        const translation = this.optionalString(raw.translation);
        const paragraphs = Array.isArray(raw.paragraphs)
          ? raw.paragraphs
              .map((p) => {
                if (!p || typeof p !== 'object') return null;
                const pObj = p as Record<string, unknown>;
                return {
                  vi: this.requireString(pObj.vi, 'paragraphs[].vi'),
                  en: this.optionalString(pObj.en),
                };
              })
              .filter((p): p is { vi: string; en: string | null } => p !== null)
          : undefined;
        const keyTerms = Array.isArray(raw.keyTerms)
          ? raw.keyTerms
              .map((k) => {
                if (!k || typeof k !== 'object') return null;
                const kObj = k as Record<string, unknown>;
                return {
                  term: this.requireString(kObj.term, 'keyTerms[].term'),
                  meaning: this.requireString(
                    kObj.meaning,
                    'keyTerms[].meaning',
                  ),
                };
              })
              .filter((k): k is { term: string; meaning: string } => k !== null)
          : undefined;
        const result: TextContentPayload = {
          body,
          ...(translation !== null ? { translation } : {}),
          ...(paragraphs ? { paragraphs } : {}),
          ...(keyTerms ? { keyTerms } : {}),
        };
        return result;
      }

      case ContentType.IMAGE: {
        const url = this.requireString(raw.url, 'payload.url');
        const caption = this.requireString(raw.caption, 'payload.caption');
        const captionEn = this.optionalString(raw.captionEn);
        const altText = this.optionalString(raw.altText);
        const source = this.optionalString(raw.source);
        const aspectRatio =
          typeof raw.aspectRatio === 'string' &&
          ['1:1', '4:3', '3:4', '16:9', '9:16', 'auto'].includes(
            raw.aspectRatio,
          )
            ? (raw.aspectRatio as ImageContentPayload['aspectRatio'])
            : 'auto';
        const result: ImageContentPayload = {
          url,
          caption,
          aspectRatio,
          ...(captionEn !== null ? { captionEn } : {}),
          ...(altText !== null ? { altText } : {}),
          ...(source !== null ? { source } : {}),
        };
        return result;
      }

      case ContentType.AUDIO: {
        const url = this.requireString(raw.url, 'payload.url');
        const title = this.requireString(raw.title, 'payload.title');
        const transcript = this.requireString(
          raw.transcript,
          'payload.transcript',
        );
        const translation = this.optionalString(raw.translation);
        const speaker = this.optionalString(raw.speaker);
        const coverImageUrl = this.optionalString(raw.coverImageUrl);
        const durationSeconds = this.optionalNumber(raw.durationSeconds);
        const segments = Array.isArray(raw.segments)
          ? raw.segments
              .map((s) => {
                if (!s || typeof s !== 'object') return null;
                const sObj = s as Record<string, unknown>;
                const startSeconds = this.optionalNumber(sObj.startSeconds);
                if (startSeconds === null) return null;
                return {
                  startSeconds,
                  vi: this.requireString(sObj.vi, 'segments[].vi'),
                  en: this.optionalString(sObj.en),
                };
              })
              .filter(
                (s): s is { startSeconds: number; vi: string; en: string | null } =>
                  s !== null,
              )
          : undefined;
        const result: AudioContentPayload = {
          url,
          title,
          transcript,
          ...(translation !== null ? { translation } : {}),
          ...(speaker !== null ? { speaker } : {}),
          ...(coverImageUrl !== null ? { coverImageUrl } : {}),
          ...(durationSeconds !== null ? { durationSeconds } : {}),
          ...(segments ? { segments } : {}),
        };
        return result;
      }

      case ContentType.VIDEO: {
        const url = this.requireString(raw.url, 'payload.url');
        const title = this.requireString(raw.title, 'payload.title');
        const thumbnailUrl = this.optionalString(raw.thumbnailUrl);
        const transcript = this.optionalString(raw.transcript);
        const translation = this.optionalString(raw.translation);
        const durationSeconds = this.optionalNumber(raw.durationSeconds);
        const aspectRatio =
          typeof raw.aspectRatio === 'string' &&
          ['16:9', '9:16', '4:3', '1:1'].includes(raw.aspectRatio)
            ? (raw.aspectRatio as VideoContentPayload['aspectRatio'])
            : '16:9';
        const provider =
          raw.provider === 'youtube' ? 'youtube' : 'self_hosted';
        const chapters = Array.isArray(raw.chapters)
          ? raw.chapters
              .map((ch) => {
                if (!ch || typeof ch !== 'object') return null;
                const chObj = ch as Record<string, unknown>;
                const startSeconds = this.optionalNumber(chObj.startSeconds);
                if (startSeconds === null) return null;
                return {
                  startSeconds,
                  title: this.requireString(chObj.title, 'chapters[].title'),
                };
              })
              .filter(
                (ch): ch is { startSeconds: number; title: string } =>
                  ch !== null,
              )
          : undefined;
        const result: VideoContentPayload = {
          url,
          title,
          aspectRatio,
          provider,
          ...(thumbnailUrl !== null ? { thumbnailUrl } : {}),
          ...(transcript !== null ? { transcript } : {}),
          ...(translation !== null ? { translation } : {}),
          ...(durationSeconds !== null ? { durationSeconds } : {}),
          ...(chapters ? { chapters } : {}),
        };
        return result;
      }

      default:
        throw new BadRequestException(`Loại nội dung không hỗ trợ: ${type}`);
    }
  }

  private derivePreview(
    type: ContentType,
    payload: LessonContentPayload,
  ): { vi: string; en: string | null } {
    switch (type) {
      case ContentType.TEXT: {
        const p = payload as TextContentPayload;
        return {
          vi: p.body,
          en: p.translation ?? null,
        };
      }
      case ContentType.IMAGE: {
        const p = payload as ImageContentPayload;
        return {
          vi: p.caption,
          en: p.captionEn ?? null,
        };
      }
      case ContentType.AUDIO: {
        const p = payload as AudioContentPayload;
        return {
          vi: p.title ? `${p.title}\n${p.transcript}` : p.transcript,
          en: p.translation ?? null,
        };
      }
      case ContentType.VIDEO: {
        const p = payload as VideoContentPayload;
        return {
          vi: p.transcript ? `${p.title}\n${p.transcript}` : p.title,
          en: p.translation ?? null,
        };
      }
      default:
        return { vi: '', en: null };
    }
  }

  private requireString(value: unknown, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} không được để trống.`);
    }
    return value;
  }

  private optionalString(value: unknown): string | null {
    if (value === undefined || value === null) return null;
    if (typeof value !== 'string') return null;
    return value.trim().length === 0 ? null : value;
  }

  private optionalNumber(value: unknown): number | null {
    if (value === undefined || value === null) return null;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  }

  private validateDialogue(dialogue: DialogueData): void {
    if (!dialogue.characters?.length) {
      throw new BadRequestException('Hội thoại cần ít nhất 1 nhân vật.');
    }
    const ids = new Set<string>();
    let rightCount = 0;
    for (const c of dialogue.characters) {
      if (!c.id) {
        throw new BadRequestException('Nhân vật cần có id.');
      }
      if (ids.has(c.id)) {
        throw new BadRequestException(`Trùng id nhân vật: ${c.id}`);
      }
      ids.add(c.id);
      if (c.side === 'right') rightCount++;
    }
    if (rightCount > 1) {
      throw new BadRequestException(
        'Chỉ được phép có tối đa 1 nhân vật ở bên phải.',
      );
    }
    for (const [i, line] of (dialogue.lines ?? []).entries()) {
      if (!ids.has(line.characterId)) {
        throw new BadRequestException(
          `Dòng ${i + 1} tham chiếu nhân vật không tồn tại: ${line.characterId}`,
        );
      }
    }
  }

  private deriveDialogueText(dialogue: DialogueData): {
    vi: string;
    en: string | null;
  } {
    const charById = new Map(dialogue.characters.map((c) => [c.id, c]));
    const viParts: string[] = [];
    const enParts: string[] = [];
    let hasEn = false;
    for (const line of dialogue.lines ?? []) {
      const name = charById.get(line.characterId)?.name ?? '';
      const vi = line.vi?.trim() ?? '';
      const en = line.en?.trim() ?? '';
      viParts.push(name ? `${name}: ${vi}` : vi);
      enParts.push(name ? `${name}: ${en}` : en);
      if (en) hasEn = true;
    }
    return {
      vi: viParts.join('\n'),
      en: hasEn ? enParts.join('\n') : null,
    };
  }

  async createGrammarRule(data: Partial<GrammarRule>): Promise<GrammarRule> {
    return this.grammarRepository.create(data);
  }

  async updateGrammarRule(
    id: string,
    data: Partial<GrammarRule>,
  ): Promise<GrammarRule> {
    await this.findGrammarById(id);
    return this.grammarRepository.update(id, data);
  }

  async deleteGrammarRule(id: string): Promise<void> {
    await this.findGrammarById(id);
    await this.grammarRepository.delete(id);
  }

  private async invalidateModuleProgress(moduleId: string): Promise<void> {
    const completedProgresses =
      await this.moduleProgressRepository.findCompletedByModule(moduleId);
    for (const progress of completedProgresses) {
      await this.moduleProgressRepository.update(progress.id, {
        status: ProgressStatus.IN_PROGRESS,
      });
    }
  }

  private async invalidateCourseProgress(courseId: string): Promise<void> {
    const completedProgresses =
      await this.courseProgressRepository.findCompletedByCourse(courseId);
    for (const progress of completedProgresses) {
      await this.courseProgressRepository.update(progress.id, {
        status: ProgressStatus.IN_PROGRESS,
      });
    }
  }

  private async findModuleById(id: string): Promise<Module> {
    const module = await this.modulesRepository.findById(id);
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    return module;
  }

  private async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findById(id);
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }
    return lesson;
  }

  private async findContentById(id: string): Promise<LessonContent> {
    const content = await this.contentsRepository.findById(id);
    if (!content) {
      throw new NotFoundException(`Content with ID ${id} not found`);
    }
    return content;
  }

  private async findGrammarById(id: string): Promise<GrammarRule> {
    const grammar = await this.grammarRepository.findById(id);
    if (!grammar) {
      throw new NotFoundException(`Grammar rule with ID ${id} not found`);
    }
    return grammar;
  }
}
