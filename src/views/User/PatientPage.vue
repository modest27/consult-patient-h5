<script setup lang="ts">
import {
  getPatientList,
  addPatient,
  editPatient,
  delPatient
} from '@/services/user'
import type { Patient, PatientList } from '@/types/user'
import { computed, onMounted, ref } from 'vue'
import { showToast, showSuccessToast, showConfirmDialog } from 'vant'
import Validator from 'id-validator'

// 初始化加载数据
const list = ref<PatientList>([])
const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
}

onMounted(() => {
  loadList()
})

// 侧边栏弹出
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
const show = ref(false)
const showPopup = (item?: Patient) => {
  if (item) {
    // 如果是编辑，结构出对应数据进行回显
    const { id, gender, name, idCard, defaultFlag } = item
    patient.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 如果是添加
    // 弹出弹框时 首先应该重置表单数据
    patient.value = { ...initPatient }
  }

  show.value = true
}
// 表单数据
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
// 默认值需要转换
const defaultFlag = computed({
  get() {
    return patient.value.defaultFlag === 1
  },
  set(value) {
    patient.value.defaultFlag = value ? 1 : 0
  }
})
const patient = ref<Patient>({ ...initPatient })

// 表单提交
const submit = async () => {
  if (!patient.value.name) return showToast('请输入姓名')
  if (!patient.value.idCard) return showToast('请输入身份证号')
  // 校验身份证号
  const validator = new Validator()
  if (!validator.isValid(patient.value.idCard))
    return showToast('身份证号不正确')
  const info = validator.getInfo(patient.value.idCard)
  if (info.sex !== patient.value.gender) return showToast('性别与身份证不符')

  // 添加患者
  patient.value.id
    ? await editPatient(patient.value)
    : await addPatient(patient.value)
  show.value = false
  loadList()
  showSuccessToast(patient.value.id ? '编辑成功' : '添加成功')
}

// 删除患者信息
const remove = async () => {
  if (patient.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`
    })
    await delPatient(patient.value.id)
    show.value = false
    loadList()
    showSuccessToast('删除成功')
  }
}
</script>

<template>
  <div class="patient-page">
    <cp-nav-bar title="家庭档案"></cp-nav-bar>
    <div class="patient-list">
      <div class="patient-item" v-for="item in list" :key="item.id">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <span class="id">{{
            item.idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '\$1******\$2')
          }}</span>
          <span>{{ item.genderValue }}</span>
          <span>{{ item.age }}岁</span>
        </div>
        <div class="icon" @click="showPopup(item)">
          <cp-icon name="user-edit" />
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <!-- 弹出层 -->
    <van-popup v-model:show="show" position="right">
      <CpNavBar
        :title="patient.id ? '编辑患者' : '添加患者'"
        :back="() => (show = false)"
        right-text="保存"
        @click-right="submit"
      ></CpNavBar>
      <!-- 表单 -->
      <van-form autocomplete="off">
        <van-field
          v-model="patient.name"
          label="真实姓名"
          placeholder="请输入真实姓名"
        />
        <van-field
          v-model="patient.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
        />
        <van-field label="性别">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn
              v-model="patient.gender"
              :options="options"
            ></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox v-model="defaultFlag" round />
          </template>
        </van-field>
      </van-form>
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="remove">删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  :deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;
    }
  }
}
.patient-list {
  padding: 15px;
}
.patient-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background-color: var(--cp-bg);
  border-radius: 8px;
  margin-bottom: 15px;
  position: relative;
  border: 1px solid var(--cp-bg);
  transition: all 0.3s;
  overflow: hidden;
  .info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
    span {
      color: var(--cp-tip);
      margin-right: 20px;
      line-height: 30px;
      &.name {
        font-size: 16px;
        color: var(--cp-text1);
        width: 80px;
        margin-right: 0;
      }
      &.id {
        color: var(--cp-text2);
        width: 180px;
      }
    }
  }
  .icon {
    color: var(--cp-tag);
    width: 20px;
    text-align: center;
  }
  .tag {
    position: absolute;
    right: 60px;
    top: 21px;
    width: 30px;
    height: 16px;
    font-size: 10px;
    color: #fff;
    background-color: var(--cp-primary);
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  &.selected {
    border-color: var(--cp-primary);
    background-color: var(--cp-plain);
    .icon {
      color: var(--cp-primary);
    }
  }
}
.patient-add {
  background-color: var(--cp-bg);
  color: var(--cp-primary);
  text-align: center;
  padding: 15px 0;
  border-radius: 8px;
  .cp-icon {
    font-size: 24px;
  }
}
.patient-tip {
  color: var(--cp-tag);
  padding: 12px 0;
}
// 底部操作栏
.van-action-bar {
  padding: 0 10px;
  margin-bottom: 10px;
  .van-button {
    color: var(--cp-price);
    background-color: var(--cp-bg);
  }
}
</style>
