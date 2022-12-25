// 二次封装axios
import { useUserStore } from '@/stores'
import router from '@/router'
import axios, { type Method } from 'axios'
import { showToast } from 'vant'

// 1. axios的配置
// 1.1 创建一个axios实例，配置基础路径，响应超时时间
// 1.2 添加请求拦截器，携带token
// 1.3 添加响应拦截器，判断业务是否成功，剥离无效数据，401错误拦截去登录页，删除用户信息

const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  baseURL,
  timeout: 10000
})

instance.interceptors.request.use(
  (config) => {
    // 修改config，比如请求头
    // 获取token
    const store = useUserStore()
    if (store.user?.token && config.headers) {
      config.headers['Authorization'] = `Bearer ${store.user?.token}`
    }
    return config
  },
  (err) => {
    return Promise.reject(err)
  }
)

instance.interceptors.response.use(
  (res) => {
    // status是200表示响应成功，res.data.code是10000表示业务成功
    // res.data.code 不是10000，vant提示失败，并报错阻断程序
    if (res.data.code !== 10000) {
      showToast(res.data.message || '网络异常')
      return Promise.reject(res.data)
    }
    return res.data
  },
  (err) => {
    // 请求响应出错
    // 遇见401调转到登录页
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转登录，带上接口失效所在页面的地址，登录完成后回跳使用
      router.push({
        path: '/login',
        query: { returnUrl: router.currentRoute.value.fullPath }
      })
    }
    return Promise.reject(err)
  }
)

// 2. 请求工具函数
// 2.1 参数：method，url，submitData
// 2.2 返回：instance 调用接口的promise对象

type Data<T> = {
  code: number
  message: string
  data: T
}

const request = <T>(
  url: string,
  method: Method = 'get',
  submitData?: object
) => {
  return instance.request<T, Data<T>>({
    url,
    method,
    [method.toUpperCase() === 'GET' ? 'params' : 'data']: submitData
  })
}

export { baseURL, instance, request }
