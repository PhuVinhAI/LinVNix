import { conveyor } from '@/lib/conveyor/api/universal'

type ConveyorKey = keyof typeof conveyor

/**
 * Use the conveyor for inter-process communication
 * Tự động dùng real hoặc mock API dựa trên platform
 *
 * @param key - The key of the conveyor object to use
 * @returns The conveyor object or the keyed object
 */
export const useConveyor = <T extends ConveyorKey | undefined = undefined>(
  key?: T
): T extends ConveyorKey ? (typeof conveyor)[T] : typeof conveyor => {
  if (key) {
    return conveyor[key] as any
  }

  return conveyor as any
}
