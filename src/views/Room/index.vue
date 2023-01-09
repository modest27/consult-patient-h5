<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="问诊室" />
    <RoomStatus></RoomStatus>
    <RoomAction></RoomAction>
  </div>
</template>

<style lang="scss" scoped></style>
