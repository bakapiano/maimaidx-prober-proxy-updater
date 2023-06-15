<template>
  <div class="main">
    <div>
      <span>查分器账号</span>
      <n-input
        v-model:value="username"
        :style="{ width: '320px', marginBottom: '10px' }"
        placeholder=""
      />
    </div>
    <div>
      <span>查分器密码</span>
      <n-input
        v-model:value="password"
        :style="{ width: '320px', marginBottom: '10px' }"
        placeholder=""
      />
    </div>
    <div>
      <span>好友代码</span>
      <n-input
        v-model:value="friendCode"
        :style="{ width: '320px', marginBottom: '10px' }"
        placeholder=""
      />
    </div>
    <n-button
      type="primary"
      :style="{ width: '320px', marginBottom: '10px' }"
      @click="submit"
    >
      提交
    </n-button>
    <!-- <n-button @click="onExportImage"> 导出图片 </n-button> -->
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { callBot } from '../api/bot.js'

const username = ref('')
const password = ref('')
const friendCode = ref('')

const submit = async () => {
  const res = await callBot(username.value, password.value, friendCode.value)
  console.log(res)
}
</script>

<style scoped>
.main {
  display: flex;
  flex-direction: column;
}
</style>
