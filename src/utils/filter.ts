import type { IllnessTime } from '@/enums'
import { flagOptions, timeOptions } from '@/services/constants'

// 获取患病时间文字
export const getIllnessTimeText = (time: IllnessTime) =>
  timeOptions.find((item) => item.value === time)?.label
// 获取就诊人数文字
export const getConsultFlagText = (flag: 0 | 1) =>
  flagOptions.find((item) => item.value === flag)?.label
