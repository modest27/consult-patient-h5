<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import { baseURL } from '@/utils/request'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'
import type { Message, TimeMessages } from '@/types/room'
import { MsgType, OrderType } from '@/enums'
import type { ConsultOrderItem, Image } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
import dayjs from 'dayjs'
import { showToast } from 'vant'

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
    // 默认一个空的聊天记录数组
    list.value = []
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
    data.forEach((item, i) => {
      // 记录消息分组第一组的时间，作为下次获取聊天记录的时间
      if (i === 0) time.value = item.createTime
      arr.push({
        id: item.createTime,
        msgType: MsgType.Notify,
        createTime: item.createTime,
        msg: {
          content: item.createTime
        }
      })
      // arr.push(...item.items)
      // 添加一个，当是下拉加载聊天记录的图片时，不需要滚动的标识
      item.items.forEach((item) => {
        arr.push({ ...item, notScroll: initialMsg.value === false })
      })
    })
    list.value.unshift(...arr)
    // 关闭刷新效果
    loading.value = false
    if (!data.length) {
      showToast('没有聊天记录了')
    }
    // 第一次需要滚动到最底部
    nextTick(() => {
      if (initialMsg.value) {
        // 第一次默认加载消息，设置最后一条消息为已读，前面消息全是已读
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
  })
  // 订单状态变更
  socket.on('statusChange', async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
  })
  // 接收消息
  socket.on('receiveChatMsg', async (msg: Message) => {
    list.value.push(msg)
    // 滚动到底部
    await nextTick()
    socket.emit('updateMsgStatus', msg.id)
    window.scrollTo(0, document.body.scrollHeight)
  })
})
onUnmounted(() => {
  socket.close()
})

// 接诊状态的控制
// 1.组件挂载后，需要知道当前的接诊状态
// 2.订单状态变更后，需要知道已经变化，更新当前接诊状态
// 3.依赖状态：
// 3.1状态栏 需要条件渲染，有倒计时
// 3.2操作栏 需要禁用和启用
const consult = ref<ConsultOrderItem>()
onMounted(async () => {
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
})

// 发送文字信息
// 1.底部操作栏组件，输入信息后需要传递给父组件
// 2.由父组件来发送信息，通过emit发送消息 sendChatMsg
// 3.接收消息，on receiveChatMsg接收服务器回的消息证明发送成功，追加到消息列表
// 4.在渲染的时候，区分是自己还是医生
const sendText = (text: string) => {
  // 根据后台约定，发送消息 发送人  收消息人  消息类型  消息内容
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgText,
    msg: {
      content: text
    }
  })
}

// 发送图片信息
// 1.底部操作栏组件，上传图片，成功后传递给父组件，{id,url}
// 2.由父组件发送来信息，通过emit发送消息 sendChatMsg
// 3.在渲染的时候，区分是自己还是医生
const sendImage = (img: Image) => {
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgImage,
    msg: {
      picture: img
    }
  })
}

// 加载更多聊天记录
// 1.默认的聊天记录滚动到最底部，第二次，第三次...不需要滚动到底部
// 2.实现下拉刷新效果
// 3.下拉刷新后，发送一个获取聊天记录的消息给后台
// 4.触发聊天记录，记录当前时间段最早的时间，作为获取聊天记录的参数给后台
// 4.1判断如果有数据，追加到数组，如果没有数据，轻提示没有数据
// 5.再次连接socket的时候需要清空聊天记录
const initialMsg = ref(true)
const loading = ref(false)
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
const onRefresh = () => {
  socket.emit('getChatMsgList', 20, time.value, consult.value?.id)
}
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <RoomStatus
      :status="consult?.status"
      :countdown="consult?.countdown"
    ></RoomStatus>
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <RoomMessage :list="list"></RoomMessage>
    </van-pull-refresh>
    <RoomAction
      @send-text="sendText"
      @send-image="sendImage"
      :disabled="consult?.status !== OrderType.ConsultChat"
    ></RoomAction>
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
