import { useCallback } from 'react'
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

export interface ReorderItem {
  id: string
  orderIndex: number
}

interface UseAdminListReorderOpts<T extends ReorderItem> {
  getItems: () => T[]
  setItems: (next: T[]) => void
  updateOrderIndex: (id: string, orderIndex: number) => Promise<unknown>
  onError?: (err: unknown) => void
}

export function useAdminListReorder<T extends ReorderItem>({
  getItems,
  setItems,
  updateOrderIndex,
  onError,
}: UseAdminListReorderOpts<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const fromId = String(active.id)
      const toId = String(over.id)

      const current = getItems()
      const sorted = [...current].sort((a, b) => a.orderIndex - b.orderIndex)
      const fromIdx = sorted.findIndex((r) => r.id === fromId)
      const toIdx = sorted.findIndex((r) => r.id === toId)
      if (fromIdx < 0 || toIdx < 0) return

      const moved = arrayMove(sorted, fromIdx, toIdx)
      const reindexed = moved.map((r, i) => ({ ...r, orderIndex: i }))
      setItems(reindexed)

      try {
        const changed = reindexed.filter(
          (r) => sorted.find((s) => s.id === r.id)?.orderIndex !== r.orderIndex,
        )
        await Promise.all(
          changed.map((r) => updateOrderIndex(r.id, r.orderIndex)),
        )
      } catch (err) {
        setItems(sorted)
        onError?.(err)
      }
    },
    [getItems, setItems, updateOrderIndex, onError],
  )

  return { sensors, handleDragEnd }
}

function arrayMove<T>(arr: T[], from: number, to: number): T[] {
  const result = arr.slice()
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}
