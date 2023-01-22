<template>
  <n-card>
    <n-spin :show="loading">
      <n-steps>
        <n-step
          :status="
            loading || loading == null ? 'wait' : success ? 'finish' : 'error'
          "
          :title="
            loading || loading == null
              ? '代理配置检测中'
              : success
              ? '代理配置正确'
              : '代理配置错误'
          "
        >
          <template #icon>
            <n-icon :component="ConstructSharp"> </n-icon>
          </template>
          <n-p v-if="loading || loading == null"> 这不会花费太长时间... </n-p>
          <n-p v-else-if="success"> 导入成功后记得还原代理配置！ </n-p>
          <n-p v-else> 请检查代理配置！ </n-p>
        </n-step>
      </n-steps>
    </n-spin>
  </n-card>
</template>

<script setup>
import { checkProxySettingStatus } from "../api/proxy";
import { ConstructSharp } from "@vicons/ionicons5";
import { ref, onMounted, watch } from "vue";

const emit = defineEmits(["update:modelValue"]);

const loading = ref(null);
const success = ref(false);
const lock = ref(false);
const checkerInterval = setInterval(() => (loading.value = true), 5000);

watch(loading, async (newValue, oldValue) => {
  if (newValue === true && lock.value == false) {
    lock.value = true;
    const status = await checkProxySettingStatus();
    if (status) {
      success.value = true;
      clearInterval(checkerInterval);
    }
    setTimeout(() => (lock.value = loading.value = false), 500);
  }
});

onMounted(() => (loading.value = true));

watch(success, (newValue, oldValue) => {
  emit("update:modelValue", newValue);
});
</script>