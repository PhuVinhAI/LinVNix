import { apiClient } from '../../../../lib/core/infrastructure/api/client'
import type {
  ConversationDetail,
  LearnerAnalytics,
  ListLearnersParams,
  PagedLearners,
  SimulationDetail,
} from '../types'

function unwrap<T>(response: { data: T | { data: T } }): T {
  return (response.data as { data?: T }).data ?? (response.data as T)
}

export class LearnersAdminRepository {
  async getLearners(params: ListLearnersParams = {}): Promise<PagedLearners> {
    const query: Record<string, string> = {}
    if (params.page != null) query.page = String(params.page)
    if (params.pageSize != null) query.pageSize = String(params.pageSize)
    if (params.search?.trim()) query.search = params.search.trim()
    if (params.level) query.level = params.level
    if (params.status && params.status !== 'all') query.status = params.status
    if (params.sort) query.sort = params.sort
    if (params.order) query.order = params.order
    const response = await apiClient.get<{ data: PagedLearners }>(
      '/admin/learners',
      { params: query },
    )
    return unwrap(response)
  }

  async getAnalytics(learnerId: string): Promise<LearnerAnalytics> {
    const response = await apiClient.get<{ data: LearnerAnalytics }>(
      `/admin/learners/${learnerId}`,
    )
    return unwrap(response)
  }

  async getConversation(learnerId: string, conversationId: string): Promise<ConversationDetail> {
    const response = await apiClient.get<{ data: ConversationDetail }>(
      `/admin/learners/${learnerId}/conversations/${conversationId}`,
    )
    return unwrap(response)
  }

  async getSimulation(learnerId: string, sessionId: string): Promise<SimulationDetail> {
    const response = await apiClient.get<{ data: SimulationDetail }>(
      `/admin/learners/${learnerId}/simulations/${sessionId}`,
    )
    return unwrap(response)
  }
}

export const learnersAdminRepository = new LearnersAdminRepository()
