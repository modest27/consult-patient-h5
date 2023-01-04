import type {
  CodeType,
  User,
  UserInfo,
  PatientList,
  Patient
} from '@/types/user'
import { request } from '@/utils/request'

// 密码登录
export const loginByPassword = (mobile: string, password: string) => {
  return request<User>('login/password', 'POST', { mobile, password })
}

// 发送验证码
export const sendMobileCode = (mobile: string, type: CodeType) => {
  return request('code', 'GET', { mobile, type })
}

// 短信登录
export const loginByMobile = (mobile: string, code: string) => {
  return request<User>('/login', 'POST', { mobile, code })
}

// 个人中心信息
export const getUserInfo = () => request<UserInfo>('patient/myUser')

// 获患者信息列表
export const getPatientList = () => request<PatientList>('patient/mylist')

// 添加患者
export const addPatient = (patient: Patient) =>
  request('patient/add', 'POST', patient)

// 编辑患者
export const editPatient = (patient: Patient) =>
  request('patient/update', 'PUT', patient)

// 删除患者信息
export const delPatient = (id: string) =>
  request(`/patient/del/${id}`, 'DELETE')
