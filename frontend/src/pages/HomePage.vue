<template>
  <n-space vertical>
    <proxy-checker v-model="proxyStatus"></proxy-checker>
    <prober-from :proxy-status="proxyStatus"></prober-from>
    <power-up />
    <frequently-asked />
    <statistic />
    <tutorial />
  </n-space>
</template>

<script setup>
import PowerUp from '../components/PowerUp.vue'
import ProxyChecker from '../components/ProxyChecker.vue'
import FrequentlyAsked from '../components/FrequentlyAsked.vue'
import Tutorial from '../components/Tutorial.vue'
import ProberFrom from '../components/ProberFrom.vue'
import Statistic from '../components/Statistic.vue'
import { watch, ref } from 'vue'

const proxyStatus = ref(false)

watch(proxyStatus, (newValue) => {
  console.log(newValue)
})
</script>

<style scoped></style>
