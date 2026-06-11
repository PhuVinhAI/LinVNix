import { Link } from 'react-router'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { ErrorState } from '../../../components/admin/ErrorState'
import { learningPath } from '../../learning/route-utils'
import { useDashboardLearners } from '../../../features/dashboard'
import {
  EmptyState,
  formatNumber,
  formatPercent,
  GREEN,
  LevelBadge,
  ListSkeleton,
  SectionCard,
  VIOLET,
} from './dashboard-ui'

/**
 * Hiệu quả khóa học: xếp theo số học viên ghi danh thật, kèm tỷ lệ
 * hoàn thành trung bình — khóa đông nhưng % thấp là nơi cần xem lại nội dung.
 */
export function CoursesSection() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useDashboardLearners()

  return (
    <SectionCard
      title="Hiệu quả khóa học"
      hint="Ghi danh thật và mức hoàn thành trung bình của từng khóa"
      icon={GraduationCap}
      iconTint={VIOLET}
    >
      {isError ? (
        <ErrorState
          title="Không tải được dữ liệu khóa học"
          message={error instanceof Error ? error.message : 'Lỗi không xác định'}
          onRetry={() => refetch()}
          retrying={isFetching}
          size="sm"
        />
      ) : isLoading || !data ? (
        <ListSkeleton rows={5} />
      ) : data.topCourses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          message="Chưa có học viên nào ghi danh khóa học"
        />
      ) : (
        <div className="space-y-2">
          {data.topCourses.map((course) => (
            <Link
              key={course.courseId}
              to={learningPath.course(course.courseId)}
              className="group flex items-center gap-4 rounded-lg border-2 border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <div className="flex-1 min-w-0">
                <p className="flex items-center gap-2 text-sm font-bold truncate">
                  <span className="truncate">{course.title}</span>
                  <LevelBadge level={course.level} />
                  {!course.isPublished && (
                    <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                      nháp
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatNumber(course.learnerCount)} học viên ·{' '}
                  {formatNumber(course.completedCount)} đã học xong
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round((course.avgCompletion ?? 0) * 100)}%`,
                        backgroundColor: GREEN,
                      }}
                    />
                  </div>
                  <span className="w-14 text-right text-xs font-bold tabular-nums">
                    {course.avgCompletion == null
                      ? '—'
                      : formatPercent(course.avgCompletion)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
          <p className="px-1 pt-1 text-[10px] text-muted-foreground">
            Mức hoàn thành = trung bình tỷ lệ bài học đã xong của các học viên trong khóa.
          </p>
        </div>
      )}
    </SectionCard>
  )
}
