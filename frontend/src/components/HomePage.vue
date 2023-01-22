<template>
  <template v-if="successPage">
    <div
      style="
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <success></success>
    </div>
  </template>
  <n-spin v-else :show="loading" size="large">
    <n-grid cols="12" responsive="screen" item-responsive>
      <n-gi span="1 l:2" />
      <n-gi span="10 l:8">
        <n-page-header title="舞萌 DX 查分器数据更新器" class="page-header">
          <template #extra>
            <n-button
              @click="emit('switchTheme')"
              circle
              strong
              quaternary
              size="small"
            >
              <n-icon>
                <moon v-if="props.themeName == 'light'"></moon>
                <sunny v-else></sunny>
              </n-icon>
            </n-button>
          </template>
        </n-page-header>
        <n-space vertical>
          <proxy-checker v-model="proxyStatus"></proxy-checker>
          <prober-from :proxy-status="proxyStatus"></prober-from>
          <frequently-asked />
          <tutorial></tutorial>
        </n-space>
      </n-gi>
      <n-gi span="1 l:2" />
    </n-grid>
  </n-spin>
</template>

<script setup>
import { NTime, useMessage } from "naive-ui";
import { FlashOutline, LogoGithub, MailOpenSharp } from "@vicons/ionicons5";
import ProxyChecker from "./ProxyChecker.vue";
import FrequentlyAsked from "./FrequentlyAsked.vue";
import Tutorial from "./Tutorial.vue";
import ProberFrom from "./ProberFrom.vue";
import Success from "./Success.vue";
import { watch, ref, onMounted } from "vue";
import { Moon, Sunny } from "@vicons/ionicons5";

const emit = defineEmits(["switchTheme"]);
const props = defineProps(["themeName"]);

const loading = ref(true);
const proxyStatus = ref(false);
const successPage = ref(window.location.href.endsWith("#Success"));

watch(proxyStatus, (newValue, oldValue) => {
  console.log(newValue);
});

onMounted(() => (loading.value = false));
</script>

<style scoped>
.page-header {
  margin-top: 12px;
  margin-bottom: 10px;
}
</style>
