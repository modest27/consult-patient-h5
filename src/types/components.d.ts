// 给components下的全局组件设置类型
import CpNavBar from '@/components/CpNavBar.vue'
import CpIcon from '@/components/CpIcon.vue'
import CpRadioBtn from '@/components/CpRadioBtn.vue'
import CpConsultMore from '@/components/CpConsultMore.vue'
import CpPaySheet from '@/components/CpPaySheet.vue'

declare module 'vue' {
  interface GlobalComponents {
    // 指定组件类型
    CpNavBar: typeof CpNavBar
    CpIcon: typeof CpIcon
    CpRadioBtn: typeof CpRadioBtn
    CpConsultMore: typeof CpConsultMore
    CpPaySheet: typeof CpPaySheet
  }
}
