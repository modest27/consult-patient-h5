<script setup lang="ts">
import { createConsultOrder, getConsultOrderPre } from '@/services/consult'
import { getPatientDetail } from '@/services/user'
import { useConsultStore } from '@/stores'
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showDialog, showToast } from 'vant'
import { onMounted, ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'

const store = useConsultStore()

// 获取订单相关信息
const payInfo = ref<ConsultOrderPreData>()
// 基本金额和优惠券信息
const loadPayInfo = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // 设置默认优惠券
  store.setCoupon(payInfo.value.couponId)
}

// 患者信息
const patient = ref<Patient>()
const loadPatientInfo = async () => {
  if (!store.consult.patientId) return
  const res = await getPatientDetail(store.consult.patientId)
  patient.value = res.data
}

onMounted(() => {
  // 5.刷新页面时，判断问诊记录是否存在，不存在就alert提示，确认之后回到首页
  if (
    !store.consult.type ||
    !store.consult.illnessType ||
    !store.consult.depId ||
    !store.consult.patientId
  ) {
    return showDialog({
      title: '温馨提示',
      message:
        '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付',
      closeOnPopstate: false
    }).then(() => {
      router.push('/')
    })
  }
  loadPayInfo()
  loadPatientInfo()
})

// 生成订单，展示支付方式的抽屉
const agree = ref(false)
const show = ref(false)
const loading = ref(false)
// const paymentMethod = ref<0 | 1>()
const orderId = ref('')

const openSheet = async () => {
  if (!agree.value) return showToast('请勾选我已同意支付协议')

  // 生成订单
  loading.value = true
  const res = await createConsultOrder(store.consult)
  orderId.value = res.data.id
  loading.value = false
  store.clear()

  // 打开选择支付方式的抽屉
  show.value = true
}

// 进行支付
// 1.隐藏关闭支付按钮
// 2.再关闭抽屉时，确认框提示，仍要关闭，就跳转到订单记录，继续支付，就关闭确认框
const router = useRouter()
const onClose = () => {
  return showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付'
  })
    .then(() => {
      // 不想关闭
      return false
    })
    .catch(() => {
      // 关闭抽屉，跳转订单记录页
      // 防止有orderId后，onBeforeRouteLeave会跳转拦截
      orderId.value = ''
      router.push('/user/consult')
      return true
    })
}
// 3.如果已经生成订单了回退时拦截
onBeforeRouteLeave(() => {
  // 如果生成订单了，回退时就拦截不让回退
  if (orderId.value) return false
})
// 4.生成支付地址然后跳转，调后台接口
// const pay = async () => {
//   if (paymentMethod.value === undefined) return showToast('请选择支付方式')
//   showToast('跳转支付')
//   const res = await getConsultOrderPayUrl({
//     orderId: orderId.value,
//     paymentMethod: paymentMethod.value,
//     payCallback: 'http://127.0.0.1:5173/room'
//   })
//   window.location.href = res.data.payUrl
// }
</script>

<template>
  <div class="consult-pay-page" v-if="payInfo && patient">
    <cp-nav-bar title="支付" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo?.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo.pointDeduction}`" />
      <van-cell
        title="实付款"
        :value="`¥${payInfo.actualPayment}`"
        class="pay-price"
      />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell
        title="患者信息"
        :value="`${patient?.name} | ${patient?.genderValue} | ${patient?.age}岁`"
      ></van-cell>
      <van-cell title="病情描述" :label="store.consult.illnessDesc"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree"
        >我已同意 <span class="text">支付协议</span></van-checkbox
      >
    </div>
    <van-submit-bar
      button-type="primary"
      :price="payInfo.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      :loading="loading"
      @click="openSheet"
    />
    <!-- 支付抽屉组件 -->
    <cp-pay-sheet
      :actual-payment="payInfo.actualPayment"
      :on-close="onClose"
      :order-id="orderId"
      pay-callback="http://127.0.0.1:5173/room"
      v-model:show="show"
    ></cp-pay-sheet>
  </div>
  <div class="consult-pay-page" v-else>
    <van-skeleton title avatar :row="4" />
    <van-skeleton title :row="5" />
    <van-skeleton title :row="3" />
  </div>
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
}
.pay-info {
  display: flex;
  padding: 15px;
  flex-wrap: wrap;
  align-items: center;
  .tit {
    width: 100%;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .img {
    margin-right: 10px;
    width: 38px;
    height: 38px;
    border-radius: 4px;
    overflow: hidden;
  }
  .desc {
    flex: 1;
    > span {
      display: block;
      color: var(--cp-tag);
      &:first-child {
        font-size: 16px;
        color: var(--cp-text2);
      }
    }
  }
}
.pay-price {
  ::v-deep() {
    .vam-cell__title {
      font-size: 16px;
    }
    .van-cell__value {
      font-size: 16px;
      color: var(--cp-price);
    }
  }
}
.pay-space {
  height: 12px;
  background-color: var(--cp-bg);
}
.pay-schema {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  .text {
    color: var(--cp-primary);
  }
}
::v-deep() {
  .van-submit-bar__button {
    font-weight: normal;
    width: 160px;
  }
}
</style>
