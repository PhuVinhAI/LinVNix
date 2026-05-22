import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('bookmarks')
@Index(['userId', 'vocabularyId'], {
  unique: true,
  where: 'vocabulary_id IS NOT NULL',
})
@Index(['userId', 'personalVocabularyId'], {
  unique: true,
  where: 'personal_vocabulary_id IS NOT NULL',
})
export class Bookmark extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocabulary_id', nullable: true })
  vocabularyId: string;

  @Column({ name: 'personal_vocabulary_id', nullable: true })
  personalVocabularyId: string;

  @ManyToOne('User', 'bookmarks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Vocabulary', 'bookmarks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: any;

  @ManyToOne('PersonalVocabulary', 'bookmarks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'personal_vocabulary_id' })
  personalVocabulary: any;
}
