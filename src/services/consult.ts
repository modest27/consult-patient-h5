import type {
  KnowledgePage,
  KnowledgeParams,
  PageParams,
  DoctorPage,
  FollowType,
  TopDep,
  Image,
  ConsultOrderPreParams,
  ConsultOrderPreData,
  PartialConsult,
  ConsultOrderItem
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

// 获取所有科室
export const getAllDep = () => request<TopDep[]>('dep/all')

// 上传图片
export const uploadImage = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return request<Image>('upload', 'POST', fd)
}

// 获取生成订单的信息
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('patient/consult/order/pre', 'GET', params)

// 生成订单
export const createConsultOrder = (data: PartialConsult) =>
  request<{ id: string }>('patient/consult/order', 'POST', data)

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: {
  paymentMethod: 0 | 1
  orderId: string
  payCallback: string
}) => request<{ payUrl: string }>('patient/consult/pay', 'POST', params)

// 获取订单详情
export const getConsultOrderDetail = (orderId: string) =>
  request<ConsultOrderItem>('patient/consult/order/detail', 'GET', { orderId })

// 查看处方
export const getPrescriptionPic = (id: string) =>
  request<{ url: string }>(`patient/consult/prescription/${id}`)
