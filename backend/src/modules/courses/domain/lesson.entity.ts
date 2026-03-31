import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { LessonType } from '../../../common/enums';

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

  @ManyToOne('Unit', 'lessons', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'unit_id' })
  unit: any;

  @OneToMany('LessonContent', 'lesson')
  contents: any[];

  @OneToMany('Vocabulary', 'lesson')
  vocabularies: any[];

  @OneToMany('GrammarRule', 'lesson')
  grammarRules: any[];

  @OneToMany('Exercise', 'lesson')
  exercises: any[];

  @OneToMany('UserProgress', 'lesson')
  userProgress: any[];
}
