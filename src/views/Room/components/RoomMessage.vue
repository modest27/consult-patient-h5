<script setup lang="ts">
import type { Message, Prescription } from '@/types/room'
import { MsgType, PrescriptionStatus } from '@/enums'
import { showImagePreview, showToast } from 'vant'
import type { Image } from '@/types/consult'
import { useUserStore } from '@/stores'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import EvaluateCard from './EvaluateCard.vue'
import { useShowPrescription } from '@/composable'
import { getConsultFlagText, getIllnessTimeText } from '@/utils/filter'

defineProps<{
  list: Message[]
}>()
const emit = defineEmits<{
  (e: 'preview-image', url?: string): void
}>()

// 预览聊天记录的图片
const watchImg = (url?: string) => {
  emit('preview-image', url)
}

// 预览病情图片
const previewImg = (pictures?: Image[]) => {
  if (pictures && pictures.length) {
    showImagePreview(pictures.map((item) => item.url))
  }
}

const store = useUserStore()
const formatTime = (time: string) => dayjs(time).format('HH:mm')

// 发送图片后滚动到底部
const loadSuccess = (notScroll?: boolean) => {
  // 如果是下拉加载的聊天记录的图片，就不需要滚动到底部
  if (notScroll) return
  window.scrollTo(0, document.body.scrollHeight)
}

// 查看处方
const { showPrescription } = useShowPrescription()

// 点击购买药品的跳转
const router = useRouter()
const buy = (pre?: Prescription) => {
  if (pre) {
    if (pre.status === PrescriptionStatus.Invalid)
      return showToast('处方已失效')
    if (pre.status === PrescriptionStatus.NotPayment && !pre.orderId) {
      return router.push(`/order/pay?id=${pre.id}`)
    }
    router.push(`/order/pay?id=${pre.orderId}`)
  }
}
</script>

<template>
  <template
    v-for="{
      msgType,
      id,
      msg,
      from,
      createTime,
      fromAvatar,
      notScroll
    } in list"
    :key="id"
  >
    <!-- 病情描述 -->
    <div class="msg msg-illness" v-if="msgType === MsgType.CardPat">
      <div class="patient van-hairline--bottom" v-if="msg.consultRecord">
        <p>
          {{ msg.consultRecord.patientInfo.name }}
          {{ msg.consultRecord.patientInfo.genderValue }}
          {{ msg.consultRecord.patientInfo.age }}岁
        </p>
        <p>
          {{ getIllnessTimeText(msg.consultRecord.illnessTime) }} |
          {{ getConsultFlagText(msg.consultRecord.consultFlag) }}
        </p>
      </div>
      <van-row>
        <van-col span="6">病情描述</van-col>
        <van-col span="18">{{ msg.consultRecord?.illnessDesc }}</van-col>
        <van-col span="6">图片</van-col>
        <van-col span="18" @click="previewImg(msg.consultRecord?.pictures)"
          >点击查看</van-col
        >
      </van-row>
    </div>
    <!-- 温馨提示-通知 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.NotifyTip">
      <div class="content">
        <span class="green">温馨提示：</span>
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 通知 -->
    <div class="msg msg-tip" v-if="msgType === MsgType.Notify">
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <!-- 发送消息-文字 -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgText && from === store.user?.id"
    >
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 发送消息-图片 -->
    <div
      class="msg msg-to"
      v-if="msgType === MsgType.MsgImage && from === store.user?.id"
    >
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image
          fit="contain"
          :src="msg.picture?.url"
          @load="loadSuccess(notScroll)"
          @click="watchImg(msg.picture?.url)"
        />
      </div>
      <van-image :src="store.user?.avatar" />
    </div>
    <!-- 接收消息-文字 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgText && from !== store.user?.id"
    >
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <div class="pao">{{ msg.content }}</div>
      </div>
    </div>
    <!-- 接收消息-图片 -->
    <div
      class="msg msg-from"
      v-if="msgType === MsgType.MsgImage && from !== store.user?.id"
    >
      <van-image :src="fromAvatar" />
      <div class="content">
        <div class="time">{{ formatTime(createTime) }}</div>
        <van-image
          fit="contain"
          :src="msg.picture?.url"
          @load="loadSuccess(notScroll)"
          @click="watchImg(msg.picture?.url)"
        />
      </div>
    </div>
    <!-- 处方消息 -->
    <div class="msg msg-recipe" v-if="msgType === MsgType.CardPre">
      <div class="content" v-if="msg.prescription">
        <div class="head van-hairline--bottom">
          <div class="head-tit">
            <h3>电子处方</h3>
            <p @click="showPrescription(msg.prescription?.id)">
              原始处方 <van-icon name="arrow"></van-icon>
            </p>
          </div>
          <p>
            {{ msg.prescription.name }}
            {{ msg.prescription.genderValue }}
            {{ msg.prescription.age }}岁 {{ msg.prescription.diagnosis }}
          </p>
          <p>开方时间：{{ msg.prescription.createTime }}</p>
        </div>
        <div class="body">
          <div
            class="body-item"
            v-for="med in msg.prescription.medicines"
            :key="med.id"
          >
            <div class="durg">
              <p>{{ med.name }} {{ med.specs }}</p>
              <p>{{ med.usageDosag }}</p>
            </div>
            <div class="num">x{{ med.quantity }}</div>
          </div>
        </div>
        <div class="foot">
          <span @click="buy(msg.prescription)">购买药品</span>
        </div>
      </div>
    </div>
    <!-- 订单取消 -->
    <div
      class="msg msg-tip msg-tip-cancel"
      v-if="msgType === MsgType.NotifyCancel"
    >
      <div class="content">
        <span>{{ msg.content }}</span>
      </div>
    </div>
    <div
      class="msg"
      v-if="msgType === MsgType.CardEva || msgType === MsgType.CardEvaForm"
    >
      <EvaluateCard :evaluateDoc="msg.evaluateDoc"></EvaluateCard>
    </div>
  </template>
</template>

<style lang="scss" scoped>
@import '@/styles/room.scss';
</style>
