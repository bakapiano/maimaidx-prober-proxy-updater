<template>
  <n-space vertical>
    <proxy-checker v-model="proxyStatus"></proxy-checker>
    <prober-from :proxy-status="proxyStatus"></prober-from>
    <frequently-asked />
    <tutorial></tutorial>
  </n-space>
</template>

<script setup>
import ProxyChecker from "../components/ProxyChecker.vue";
import FrequentlyAsked from "../components/FrequentlyAsked.vue";
import Tutorial from "../components/Tutorial.vue";
import ProberFrom from "../components/ProberFrom.vue";
import { watch, ref, onMounted } from "vue";

const proxyStatus = ref(false);

watch(proxyStatus, (newValue, oldValue) => {
  console.log(newValue);
});
</script>

<style scoped>
</style>
