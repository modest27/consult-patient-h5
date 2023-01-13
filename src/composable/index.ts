import { onMounted, ref } from 'vue'
import {
  cancelOrder,
  deleteOrder,
  followDoctor,
  getPrescriptionPic
} from '@/services/consult'
import type { ConsultOrderItem, FollowType } from '@/types/consult'
import { showFailToast, showImagePreview, showSuccessToast } from 'vant'
import { OrderType } from '@/enums'
import { getMedicalOrderDetail } from '@/services/order'
import type { OrderDetail } from '@/types/order'

// 关注hook
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  const follow = async (obj: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followDoctor(obj.id, type)
      obj.likeFlag = obj.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }

  return { loading, follow }
}

// 查看处方hook
export const useShowPrescription = () => {
  // 查看处方原始图片
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      showImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}

// 取消订单hook
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = (item: ConsultOrderItem) => {
    loading.value = true
    cancelOrder(item.id)
      .then(() => {
        item.status = OrderType.ConsultCancel
        item.statusValue = '已取消'
        showSuccessToast('取消成功')
      })
      .catch(() => {
        showFailToast('取消失败')
      })
      .finally(() => {
        loading.value = false
      })
  }
  return { loading, cancelConsultOrder }
}

// 删除订单hook
export const useDeleteOrder = (cb: () => void) => {
  const deleteLoading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    deleteLoading.value = true
    try {
      await deleteOrder(item.id)
      // 成功
      // 通知父组件删除该项
      cb && cb()
      showSuccessToast('删除成功')
    } catch (e) {
      showFailToast('删除失败')
    } finally {
      deleteLoading.value = false
    }
  }
  return { deleteLoading, deleteConsultOrder }
}

// 获取订单详情数据hook封装
export const useOrderDetail = (id: string) => {
  const loading = ref(false)
  const order = ref<OrderDetail>()
  onMounted(async () => {
    loading.value = true
    try {
      const res = await getMedicalOrderDetail(id)
      order.value = res.data
    } finally {
      loading.value = false
    }
  })
  return { order, loading }
}
