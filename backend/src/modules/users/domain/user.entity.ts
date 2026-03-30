import { Entity, Column, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { BaseEntity } from '../../../database/base/base.entity';
import { UserLevel } from '../../../common/enums';
import { UserProgress } from '../../progress/domain/user-progress.entity';
import { UserVocabulary } from '../../vocabularies/domain/user-vocabulary.entity';
import { UserExerciseResult } from '../../exercises/domain/user-exercise-result.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ name: 'native_language', default: 'English' })
  nativeLanguage: string;

  @Column({
    type: 'enum',
    enum: UserLevel,
    name: 'current_level',
    default: UserLevel.A1,
  })
  currentLevel: UserLevel;

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @OneToMany(() => UserProgress, (progress) => progress.user)
  progress: UserProgress[];

  @OneToMany(() => UserVocabulary, (vocabulary) => vocabulary.user)
  vocabularies: UserVocabulary[];

  @OneToMany(() => UserExerciseResult, (result) => result.user)
  exerciseResults: UserExerciseResult[];
}
