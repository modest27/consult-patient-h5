<script lang="ts" setup>
import { onUnmounted, ref } from 'vue'
import { mobileRules, passwordRules, codeRules } from '@/utils/rules'
import { showToast, showSuccessToast, type FormInstance } from 'vant'
import { loginByPassword, sendMobileCode, loginByMobile } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'

// 表单数据
const mobile = ref('')
const password = ref('')
const code = ref('')
// 控制密码是否显示
const show = ref(false)
// 控制是否勾选用户协议
const agree = ref(false)

const store = useUserStore()
const router = useRouter()
const route = useRoute()

// 切换短信登录
const isPass = ref(true)

const login = async () => {
  if (!agree.value) return showToast('请勾选用户协议')
  // 验证完毕，进行登录
  const res = isPass.value
    ? await loginByPassword(mobile.value, password.value)
    : await loginByMobile(mobile.value, code.value)
  store.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  router.push((route.query.returnUrl as string) || '/user')
  showSuccessToast('登录成功')
}

// 发送短信验证码
const time = ref(0)
const form = ref<FormInstance | null>(null)
let timerId: number
const send = async () => {
  if (time.value > 0) return
  await form.value?.validate('mobile')
  // 上面校验成功
  await sendMobileCode(mobile.value, 'login')
  showSuccessToast('发送成功')
  time.value = 60
  // 倒计时
  if (timerId) clearInterval(timerId)
  timerId = window.setInterval(() => {
    time.value--
    if (time.value <= 0) window.clearInterval(timerId)
  }, 1000)
}

onUnmounted(() => {
  clearInterval(timerId)
})
</script>

<template>
  <div class="login-page">
    <CpNavBar
      rightText="注册"
      @clickRight="$router.push('/register')"
    ></CpNavBar>
    <!-- 头部 -->
    <div class="login-head">
      <h3>{{ isPass ? '密码登录' : '短信验证码登录' }}</h3>
      <a href="javascript:;" @click="isPass = !isPass">
        <span>{{ !isPass ? '密码登录' : '短信验证码登录' }}</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- 表单 -->
    <van-form autocomplete="off" @submit="login" ref="form">
      <van-field
        name="mobile"
        v-model="mobile"
        :rules="mobileRules"
        type="tel"
        placeholder="请输入手机号"
      ></van-field>
      <van-field
        v-if="isPass"
        v-model="password"
        :rules="passwordRules"
        placeholder="请输入密码"
        :type="show ? 'text' : 'password'"
      >
        <template #button>
          <CpIcon
            @click="show = !show"
            :name="`login-eye-${show ? 'on' : 'off'}`"
          ></CpIcon>
        </template>
      </van-field>
      <van-field
        v-else
        placeholder="短信验证码"
        :rules="codeRules"
        v-model="code"
      >
        <template #button>
          <span class="btn-send" :class="{ active: time > 0 }" @click="send">{{
            time > 0 ? `${time}s后再次发送` : '发送验证码'
          }}</span>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit"
          >登 录</van-button
        >
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <!-- 底部 -->
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <img src="@/assets/qq.svg" alt="" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }
  &-head {
    display: flex;
    padding: 30px 30px 50px;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;
    h3 {
      font-weight: normal;
      font-size: 24px;
    }
    a {
      font-size: 15px;
    }
  }
  &-other {
    margin-top: 60px;
    padding: 0 30px;
    .icon {
      display: flex;
      justify-content: center;
      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}
.van-form {
  padding: 0 14px;
  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
  .btn-send {
    color: var(--cp-primary);
    &.active {
      color: rgba(22, 194, 163, 0.5);
    }
  }
}
</style>
