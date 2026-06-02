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

  async createContent(data: Partial<LessonContent>): Promise<LessonContent> {
    return this.contentsRepository.create(this.prepareContentPayload(data));
  }

  async updateContent(
    id: string,
    data: Partial<LessonContent>,
  ): Promise<LessonContent> {
    const existing = await this.findContentById(id);
    const effectiveType = (data.contentType ?? existing.contentType) as ContentType;
    const effectiveDialogue =
      data.dialogueData !== undefined ? data.dialogueData : existing.dialogueData;
    const merged: Partial<LessonContent> = {
      ...data,
      contentType: effectiveType,
      dialogueData: effectiveDialogue,
    };
    return this.contentsRepository.update(id, this.prepareContentPayload(merged));
  }

  async deleteContent(id: string): Promise<void> {
    await this.findContentById(id);
    await this.contentsRepository.delete(id);
  }

  /**
   * Hợp nhất xử lý dialogue:
   * - Nếu contentType=dialogue: bắt buộc có dialogueData hợp lệ, derive vietnameseText/translation từ lines.
   * - Nếu khác: clear dialogueData (tránh dirty data từ lần đổi type).
   */
  private prepareContentPayload(
    data: Partial<LessonContent>,
  ): Partial<LessonContent> {
    if (data.contentType !== ContentType.DIALOGUE) {
      return { ...data, dialogueData: null };
    }
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
      vietnameseText: vi,
      translation: en ?? undefined,
    };
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
