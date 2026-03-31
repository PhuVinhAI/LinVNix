import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';

@Entity('units')
export class Unit extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ name: 'course_id' })
  courseId: string;

  @ManyToOne('Course', 'units', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: any;

  @OneToMany('Lesson', 'unit')
  lessons: any[];
}
