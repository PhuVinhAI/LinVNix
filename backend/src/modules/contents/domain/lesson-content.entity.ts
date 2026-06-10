import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../database/base/base.entity';
import { ContentType } from '../../../common/enums';
import type { DialogueData } from './dialogue-data.types';
import type { LessonContentPayload } from './lesson-content-payload.types';

/**
 * LessonContent — bảng phẳng theo order_index để giữ thứ tự trộn lẫn các loại
 * (văn bản, hình ảnh, âm thanh, video, hội thoại) trong một bài học.
 *
 * Schema theo loại:
 * - Mỗi loại (text/image/audio/video) lưu cấu trúc đầy đủ trong cột `payload`
 *   (jsonb) — xem lesson-content-payload.types.ts. Cột vietnameseText và
 *   translation cấp entity là bản preview rút gọn dùng cho list/search; payload
 *   là nguồn chính.
 * - DIALOGUE lưu trong `dialogue_data` (jsonb) — giữ schema riêng vì có nhân vật
 *   + nhiều lời thoại, không thống nhất với 4 loại đơn lẻ.
 */
@Entity('lesson_contents')
@Index(['lessonId', 'orderIndex'], {
  unique: true,
  where: 'deleted_at IS NULL',
})
export class LessonContent extends BaseEntity {
  @Column({
    type: 'enum',
    enum: ContentType,
    name: 'content_type',
  })
  contentType: ContentType;

  /** Preview rút gọn — service tự sinh từ payload khi insert/update. */
  @Column({ name: 'vietnamese_text', type: 'text' })
  vietnameseText: string;

  /** Bản dịch preview — sinh từ payload tương ứng (caption/transcript/body). */
  @Column({ type: 'text', nullable: true })
  translation?: string | null;

  /** Schema theo content_type — xem lesson-content-payload.types.ts. */
  @Column({ type: 'jsonb', nullable: true })
  payload?: LessonContentPayload | null;

  /** Chỉ dùng cho DIALOGUE — nhân vật + lời thoại. */
  @Column({ name: 'dialogue_data', type: 'jsonb', nullable: true })
  dialogueData?: DialogueData | null;

  @Column({ name: 'order_index' })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  notes?: string | null;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @ManyToOne('Lesson', 'contents', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: any;
}
