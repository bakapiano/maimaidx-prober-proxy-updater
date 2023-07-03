<template>
  <n-spin :show="loading">
    <n-card class="card" title="导入数据">
      <n-form ref="formRef" class="form" :rules="rules" :model="formValue">
        <n-form-item path="username" label="查分器账号">
          <n-input v-model:value="formValue.username" placeholder="username" />
        </n-form-item>
        <n-form-item path="password" label="查分器密码">
          <n-input
            v-model:value="formValue.password"
            placeholder="password"
            type="password"
            show-password-on="click"
          />
        </n-form-item>
        <n-form-item path="friendCode" label="好友代码">
          <n-input
            v-model:value="formValue.friendCode"
            placeholder="friendCode"
          />
        </n-form-item>
      </n-form>
      <template #action>
        <n-space justify="space-between">
          <n-space>
            <n-button type="success" @click="submit"> 更新 </n-button>
            <n-button type="error" @click="clearForm"> 清空 </n-button>
          </n-space>
        </n-space>
      </template>
    </n-card>
  </n-spin>
</template>

<script setup>
import { postBotForm } from '../api/bot.js'
import { ref } from 'vue'
import { useMessage, useDialog } from 'naive-ui'

const loading = ref(false)
const message = useMessage()
const dialog = useDialog()
const formValue = ref({
  username: '',
  password: '',
  friendCode: '',
})
const rules = ref({
  username: {
    required: true,
    message: '请输入查分器账户',
  },
  password: {
    required: true,
    message: '请输入查分器密码',
  },
  friendCode: {
    required: true,
    message: '请输入好友代码',
  },
})
const formRef = ref(null)

function clearForm() {
  formValue.value.username =
    formValue.value.password =
    formValue.value.friendCode =
      ''
}

async function submit() {
  formRef.value.validate(async (errors) => {
    if (errors) return
    loading.value = true
    try {
      const result = await postBotForm(
        formValue.value.username,
        formValue.value.password,
        formValue.value.friendCode
      )
      window.location.href = result.data
    } catch (err) {
      message.error(err.response.data ? err.response.data : err.message)
    } finally {
      loading.value = false
    }
  })
}
</script>

<style></style>
