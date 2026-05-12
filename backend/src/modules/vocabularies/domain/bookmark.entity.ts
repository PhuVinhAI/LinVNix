import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('bookmarks')
@Unique(['userId', 'vocabularyId'])
export class Bookmark extends BaseEntity {
  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'vocabulary_id' })
  vocabularyId: string;

  @ManyToOne('User', 'bookmarks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: any;

  @ManyToOne('Vocabulary', 'bookmarks', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'vocabulary_id' })
  vocabulary: any;
}
