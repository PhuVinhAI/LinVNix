import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { MasteryLevel } from '../../../common/enums';
import { User } from '../../users/domain/user.entity';
import { Vocabulary } from './vocabulary.entity';

@Entity('user_vocabularies')
export class UserVocabulary extends BaseEntity {
  @Column({
    type: 'enum',
    enum: MasteryLevel,
    name: 'mastery_level',
    default: MasteryLevel.LEARNING,
  })
  masteryLevel: MasteryLevel;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'correct_count', default: 0 })
  correctCount: number;

  @Column({ name: 'last_reviewed_at', nullable: true })
  lastReviewedAt?: Date;

  @Column({ name: 'next_review_at', nullable: true })
  nextReviewAt?: Date;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocabulary_id' })
  vocabularyId: string;

  @ManyToOne(() => User, (user) => user.vocabularies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Vocabulary, (vocabulary) => vocabulary.userVocabularies, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: Vocabulary;
}
