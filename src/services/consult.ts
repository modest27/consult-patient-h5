import type {
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  DoctorPage,
  FollowType
} from '@/types/consult'
import { request } from '@/utils/request'

// 获取文章列表
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('patient/home/knowledge', 'GET', params)

// 获取关注医生列表
export const getDoctorPage = (params: PageParams) =>
  request<DoctorPage>('home/page/doc', 'GET', params)

// 关注医生
export const followDoctor = (id: string, type: FollowType = 'doc') =>
  request('/like', 'POST', { id, type })
