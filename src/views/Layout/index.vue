<script setup lang="ts"></script>

<template>
  <div class="layout-page">
    <!-- 二级路由的出口 article home notify user等组件-->
    <router-view></router-view>
    <!-- 底部tab栏 -->
    <van-tabbar route>
      <van-tabbar-item replace to="/home"
        >首页<template #icon="{ active }"
          ><CpIcon
            :name="`home-index-${active ? 'active' : 'default'}`"
          ></CpIcon></template
      ></van-tabbar-item>
      <van-tabbar-item replace to="/article"
        >健康百科<template #icon="{ active }"
          ><CpIcon
            :name="`home-article-${active ? 'active' : 'default'}`"
          ></CpIcon></template
      ></van-tabbar-item>
      <van-tabbar-item replace to="/notify"
        >消息通知<template #icon="{ active }"
          ><CpIcon
            :name="`home-notice-${active ? 'active' : 'default'}`"
          ></CpIcon></template
      ></van-tabbar-item>
      <van-tabbar-item replace to="/user"
        >我的<template #icon="{ active }"
          ><CpIcon
            :name="`home-mine-${active ? 'active' : 'default'}`"
          ></CpIcon></template
      ></van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<style lang="scss" scoped>
.layout-page {
  :deep() {
    .van-tabbar-item {
      &__icon {
        font-size: 21px;
      }
      &__text {
        font-size: 11px;
      }
      &:not(.van-tabbar-item--active) {
        color: var(--cp-text3);
      }
    }
  }
}
</style>
