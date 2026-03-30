import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { LessonType } from '../../../common/enums';
import { Unit } from './unit.entity';
import { LessonContent } from '../../contents/domain/lesson-content.entity';
import { Vocabulary } from '../../vocabularies/domain/vocabulary.entity';
import { GrammarRule } from '../../grammar/domain/grammar-rule.entity';
import { Exercise } from '../../exercises/domain/exercise.entity';
import { UserProgress } from '../../progress/domain/user-progress.entity';

@Entity('lessons')
export class Lesson extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: LessonType,
    name: 'lesson_type',
  })
  lessonType: LessonType;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'estimated_duration', nullable: true })
  estimatedDuration?: number;

  @Column({ name: 'unit_id' })
  unitId: string;

  @ManyToOne(() => Unit, (unit) => unit.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @OneToMany(() => LessonContent, (content) => content.lesson)
  contents: LessonContent[];

  @OneToMany(() => Vocabulary, (vocabulary) => vocabulary.lesson)
  vocabularies: Vocabulary[];

  @OneToMany(() => GrammarRule, (grammar) => grammar.lesson)
  grammarRules: GrammarRule[];

  @OneToMany(() => Exercise, (exercise) => exercise.lesson)
  exercises: Exercise[];

  @OneToMany(() => UserProgress, (progress) => progress.lesson)
  userProgress: UserProgress[];
}
