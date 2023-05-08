<template>
  <n-result
    status="error"
    title="错误"
    description="少侠请重新来过；如果问题持续存在，请联系作者。"
  >
    <template #footer>
      <RouterLink to="/"><n-button>返回主页</n-button></RouterLink>
    </template>
  </n-result>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped></style>
