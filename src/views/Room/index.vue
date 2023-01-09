<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { onMounted, onUnmounted, ref } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import type { Message, TimeMessages } from '@/types/room'
import { MsgType } from '@/enums'

// 1.组件挂载时建立连接，组件卸载时关闭连接
const store = useUserStore()
const route = useRoute()
let socket: Socket
const list = ref<Message[]>([])
onMounted(() => {
  socket = io(baseURL, {
    // 身份认证
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    // 订单ID
    query: {
      orderId: route.query.orderId
    }
  })
  // 连接成功
  socket.on('connect', () => {
    console.log('连接成功')
  })
  // 断开连接
  socket.on('disconnect', () => {
    console.log('断开连接')
  })
  // 出现错误
  socket.on('error', (err) => {
    console.log('出现错误', err)
  })

  // 聊天记录（默认消息）
  // 1.绑定消息记录事件，后台连接成功后主动发送聊天记录
  // 2.拿到消息分组后，处理成可以的消息列表 Message[]
  // 3.定义响应式数据，接收数据，依据数据进行渲染即可
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    // 处理消息：分组的时间自己处理成一条通用的消息，items取出来放后面
    const arr: Message[] = []
    data.forEach((item) => {
      arr.push({
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      arr.push(...item.items)
    })
    list.value.unshift(...arr)
  })
})
onUnmounted(() => {
  socket.close()
})
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <RoomStatus></RoomStatus>
    <RoomMessage></RoomMessage>
    <RoomAction></RoomAction>
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);
  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
