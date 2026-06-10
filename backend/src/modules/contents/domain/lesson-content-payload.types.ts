/**
 * Payload có cấu trúc theo từng loại nội dung bài học. Mỗi loại có UI riêng
 * trên mobile, nên schema cũng tách riêng — không dùng cột audio_url/image_url
 * /video_url phẳng cũ. Tất cả lưu trong cột `payload` jsonb của lesson_contents.
 *
 * Hợp đồng tổng quát:
 * - Mỗi payload là một object có thể serialize JSON.
 * - vietnameseText cấp entity là bản preview rút gọn (cho list/search), được
 *   service tự sinh từ payload — đừng coi nó là nguồn chính.
 */

export type ImageAspectRatio = '1:1' | '4:3' | '3:4' | '16:9' | '9:16' | 'auto';
export type VideoAspectRatio = '16:9' | '9:16' | '4:3' | '1:1';
export type VideoProvider = 'self_hosted' | 'youtube';

/** Đoạn văn cho học viên đọc — có thể tách paragraph + từ vựng chìa khoá. */
export interface TextContentPayload {
  /** Toàn bộ đoạn văn tiếng Việt (raw). */
  body: string;
  /** Bản dịch tiếng Anh tương ứng (toàn đoạn). */
  translation?: string | null;
  /**
   * Tuỳ chọn — tách thành các đoạn paragraph để render với khoảng cách hợp lý
   * trên mobile. Nếu rỗng, mobile sẽ tự split body theo dòng trống.
   */
  paragraphs?: Array<{
    vi: string;
    en?: string | null;
  }>;
  /** Tuỳ chọn — highlight các từ/cụm từ chìa khoá ngay trong bài đọc. */
  keyTerms?: Array<{
    term: string;
    meaning: string;
  }>;
}

/** Hình ảnh minh hoạ — luôn cần URL + chú thích, các trường còn lại tuỳ chọn. */
export interface ImageContentPayload {
  /** URL ảnh (local /uploads/... hoặc absolute). */
  url: string;
  /** Chú thích tiếng Việt. */
  caption: string;
  /** Bản dịch chú thích. */
  captionEn?: string | null;
  /** Alt text cho accessibility — fallback về caption nếu rỗng. */
  altText?: string | null;
  /** Tỉ lệ hiển thị — mobile dùng để chọn AspectRatio container. */
  aspectRatio?: ImageAspectRatio;
  /** Nguồn / tác giả — hiện cuối ảnh dưới dạng caption phụ. */
  source?: string | null;
}

/** Đoạn âm thanh — phải có URL + transcript (lời thoại). */
export interface AudioContentPayload {
  /** URL file âm thanh. */
  url: string;
  /** Tiêu đề ngắn — hiện trên player ("Hội thoại buổi sáng"...). */
  title: string;
  /** Thời lượng — mobile dùng để hiển thị khi chưa load metadata. */
  durationSeconds?: number | null;
  /** Người nói — hiện nhỏ dưới title. */
  speaker?: string | null;
  /** Ảnh cover hiển thị to phía sau player (như podcast art). */
  coverImageUrl?: string | null;
  /** Transcript tiếng Việt — gập/mở. */
  transcript: string;
  /** Bản dịch transcript. */
  translation?: string | null;
  /**
   * Tuỳ chọn — các đoạn có timestamp để học viên tua theo câu.
   * Mobile có thể không dùng giai đoạn đầu, nhưng schema đã sẵn sàng.
   */
  segments?: Array<{
    startSeconds: number;
    vi: string;
    en?: string | null;
  }>;
}

/** Video bài giảng — URL bắt buộc, transcript khuyến nghị. */
export interface VideoContentPayload {
  /** URL video (hoặc YouTube id nếu provider = youtube). */
  url: string;
  /** Tiêu đề ngắn — hiện trên player. */
  title: string;
  /** Thời lượng. */
  durationSeconds?: number | null;
  /** Ảnh thumbnail hiển thị trước khi play. */
  thumbnailUrl?: string | null;
  /** Tỉ lệ — mobile dùng để render container. */
  aspectRatio?: VideoAspectRatio;
  /** Nguồn — youtube hoặc tự host. */
  provider?: VideoProvider;
  /** Transcript tiếng Việt. */
  transcript?: string | null;
  /** Bản dịch transcript. */
  translation?: string | null;
  /** Các chương / mốc thời gian — mobile có thể list dạng pill. */
  chapters?: Array<{
    startSeconds: number;
    title: string;
  }>;
}

export type LessonContentPayload =
  | TextContentPayload
  | ImageContentPayload
  | AudioContentPayload
  | VideoContentPayload;
