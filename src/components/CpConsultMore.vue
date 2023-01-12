<script setup lang="ts">
import { computed, ref } from 'vue'

// 是否禁用的props
const props = defineProps<{
  disabled: boolean
}>()

const showPopover = ref(false)
const actions = computed(() => [
  { text: '查看处方', disabled: props.disabled },
  { text: '删除订单' }
])

const emit = defineEmits<{
  (e: 'on-delete'): void
  (e: 'on-preview'): void
}>()

const onSelect = (action: { text: string }, i: number) => {
  // 点击选项
  if (i === 0) {
    // 点击了查看处方
    // showPrescription(props.item.prescriptionId)
    emit('on-preview')
  }
  if (i === 1) {
    // 点击了删除订单
    // deleteConsultOrder(props.item)
    emit('on-delete')
  }
}
</script>

<template>
  <div class="cp-consult-more">
    <van-popover
      v-model:show="showPopover"
      :actions="actions"
      @select="onSelect"
      placement="top-start"
    >
      <template #reference> 更多 </template>
    </van-popover>
  </div>
</template>

<style lang="scss" scoped>
.cp-consult-more {
  color: var(--cp-tag);
  flex: 1;
  font-size: 13px;
}
</style>
