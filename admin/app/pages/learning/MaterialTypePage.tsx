import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Breadcrumbs } from '../../components/admin/Breadcrumbs'
import { useAdminListReorder } from '../../components/admin/hooks/use-admin-list-reorder'
import { useAdminLesson, useLearningAdminMutation } from '../../features/learning/api/use-learning-admin'
import type { Lesson, LessonContent } from '../../features/learning/types'
import { MATERIAL_TYPES, materialTypeMeta } from './authoring-meta'
import { ConfirmDeleteDialog, PageHero, SectionHeader, SortableItemRow } from './authoring-ui'
import { learningPath } from './route-utils'

/**
 * Khu soạn của MỘT loại Nội dung bài (sau khi đã chọn loại).
 * Màn hình này chỉ làm một việc: chọn mục của loại này để mở form soạn riêng.
 */
export function MaterialTypePage() {
  const { lessonId, materialType } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { data: lesson } = useAdminLesson(lessonId)
  const mutations = useLearningAdminMutation()
  const [pendingDelete, setPendingDelete] = useState<LessonContent | null>(null)

  const meta = materialTypeMeta(materialType)
  const lessonKey = ['admin-learning', 'lesson', lessonId] as const

  const { sensors, handleDragEnd } = useAdminListReorder<LessonContent>({
    getItems: () => {
      const cached = qc.getQueryData<Lesson>(lessonKey)
      return (cached?.contents ?? []).filter(
        (c) => (c.contentType ?? '').toLowerCase() === meta?.value,
      )
    },
    setItems: (nextOfType) => {
      qc.setQueryData<Lesson>(lessonKey, (prev) => {
        if (!prev) return prev
        const byId = new Map(nextOfType.map((c) => [c.id, c]))
        return {
          ...prev,
          contents: (prev.contents ?? []).map((c) => byId.get(c.id) ?? c),
        }
      })
    },
    reorder: (items) => mutations.reorderContents.mutateAsync(items),
    onError: () => toast.error('Không thể sắp xếp lại nội dung'),
  })

  if (!lessonId) return <Navigate to={learningPath.courses()} replace />
  if (!meta) return <Navigate to={learningPath.lessonSection(lessonId, 'materials')} replace />

  const rows = (lesson?.contents ?? [])
    .filter((c) => (c.contentType ?? '').toLowerCase() === meta.value)
    .sort((a, b) => a.orderIndex - b.orderIndex)

  const confirmDelete = async () => {
    if (!pendingDelete) return
    try {
      await mutations.deleteLessonChild.mutateAsync({ kind: 'contents', id: pendingDelete.id })
      toast.success('Đã xóa nội dung')
      setPendingDelete(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể xóa')
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs
        items={[
          { label: lesson?.title ?? 'Bài học', href: learningPath.lesson(lessonId) },
          { label: 'Nội dung bài học', href: learningPath.lessonStageContent(lessonId) },
          { label: 'Nội dung bài', href: learningPath.lessonSection(lessonId, 'materials') },
          { label: meta.label },
        ]}
      />

      <PageHero
        Icon={meta.Icon}
        iconClass={`${meta.bg} text-white`}
        title={meta.label}
        count={{ value: rows.length, label: 'mục' }}
        description={meta.description}
        actions={
          <Button asChild variant="outline">
            <Link to={learningPath.lessonSection(lessonId, 'materials')}>
              <ArrowLeft className="h-4 w-4" />
              Chọn loại khác
            </Link>
          </Button>
        }
      />

      <div className="space-y-4">
        <SectionHeader
          title={`Danh sách ${meta.label.toLowerCase()}`}
          description="Kéo để sắp xếp lại thứ tự hiển thị cho học viên."
          actions={
            <Button asChild>
              <Link to={learningPath.materialNew(lessonId, meta.value)}>
                <Plus className="h-4 w-4" />
                Thêm {meta.label.toLowerCase()}
              </Link>
            </Button>
          }
        />

        {rows.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
            <meta.Icon className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
            <h3 className="text-lg font-bold mb-1">Chưa có {meta.label.toLowerCase()}</h3>
            <p className="text-sm text-muted-foreground mb-4">{meta.description}</p>
            <Button asChild>
              <Link to={learningPath.materialNew(lessonId, meta.value)}>
                <Plus className="h-4 w-4" />
                Tạo mục đầu tiên
              </Link>
            </Button>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {rows.map((row) => (
                  <SortableItemRow
                    key={row.id}
                    id={row.id}
                    onOpen={() => navigate(learningPath.materialEdit(lessonId, meta.value, row.id))}
                    onDelete={() => setPendingDelete(row)}
                    leading={
                      <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${meta.bg}`}>
                        <meta.Icon className="h-5 w-5" />
                      </div>
                    }
                    title={materialRowTitle(row)}
                    meta={
                      row.translation ? (
                        <span className="truncate">{row.translation}</span>
                      ) : (
                        <span className="italic text-muted-foreground/70">Chưa có bản dịch</span>
                      )
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <ConfirmDeleteDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        resource="nội dung"
        label={materialRowTitle(pendingDelete ?? undefined) || meta.label}
        onConfirm={confirmDelete}
      />
    </div>
  )
}

function materialRowTitle(row: LessonContent | undefined): string {
  if (!row) return ''
  if (row.vietnameseText?.trim()) {
    return row.vietnameseText.length > 80 ? `${row.vietnameseText.slice(0, 80)}…` : row.vietnameseText
  }
  const type = (row.contentType ?? '').toLowerCase()
  if (type === 'dialogue') {
    const lines = row.dialogueData?.lines ?? []
    const first = lines.find((l) => l.vi?.trim())
    if (first?.vi) return first.vi.length > 80 ? `${first.vi.slice(0, 80)}…` : first.vi
    return `Hội thoại · ${lines.length} lời thoại`
  }
  const label = MATERIAL_TYPES.find((t) => t.value === type)?.label ?? 'Nội dung'
  return `${label} (chưa có nội dung chữ)`
}
