import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { learnersAdminRepository } from './learners-admin.repository'
import type { ListLearnersParams } from '../types'

export function useAdminLearners(params: ListLearnersParams = {}) {
  return useQuery({
    queryKey: ['admin-learners', params],
    queryFn: () => learnersAdminRepository.getLearners(params),
    placeholderData: keepPreviousData,
  })
}

export function useAdminLearnerAnalytics(learnerId?: string) {
  return useQuery({
    queryKey: ['admin-learners', learnerId, 'analytics'],
    queryFn: () => learnersAdminRepository.getAnalytics(learnerId as string),
    enabled: !!learnerId,
  })
}

export function useAdminLearnerConversation(learnerId?: string, conversationId?: string) {
  return useQuery({
    queryKey: ['admin-learners', learnerId, 'conversation', conversationId],
    queryFn: () =>
      learnersAdminRepository.getConversation(
        learnerId as string,
        conversationId as string,
      ),
    enabled: !!learnerId && !!conversationId,
  })
}

export function useAdminLearnerSimulation(learnerId?: string, sessionId?: string) {
  return useQuery({
    queryKey: ['admin-learners', learnerId, 'simulation', sessionId],
    queryFn: () =>
      learnersAdminRepository.getSimulation(
        learnerId as string,
        sessionId as string,
      ),
    enabled: !!learnerId && !!sessionId,
  })
}
