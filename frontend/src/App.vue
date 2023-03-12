<template>
  <n-config-provider
    :theme="themeName == 'light' ? lightTheme : darkTheme"
    style="height: 100%"
  >
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-spin :show="loading" size="large">
          <n-grid cols="12" responsive="screen" item-responsive>
            <n-gi span="1 l:2" />
            <n-gi span="10 l:8">
              <n-page-header title="舞萌 DX 查分器数据更新器" class="page-header" :back="router.path === '/' ? undefined : () => router.push('/')">
                <template #extra>
                  <n-button
                    @click="switchTheme"
                    circle
                    strong
                    quaternary
                    size="small"
                  >
                    <n-icon>
                      <moon v-if="themeName == 'light'"></moon>
                      <sunny v-else></sunny>
                    </n-icon>
                  </n-button>
                </template>
              </n-page-header>
              <RouterView></RouterView>
            </n-gi>
            <n-gi span="1 l:2" />
          </n-grid>
        </n-spin>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup >
import { defineComponent, provide, ref, onMounted } from "vue";
import { darkTheme, lightTheme } from "naive-ui";
import { RouterView } from "vue-router"
import { Moon, Sunny } from "@vicons/ionicons5";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

console.log(route.path)

let themeName = ref(localStorage.theme === "dark" ? "dark" : "light");

provide("themeName", themeName);

const loading = ref(true);

onMounted(() => (loading.value = false));

function switchTheme() {
  themeName.value = themeName.value == "light" ? "dark" : "light";
  localStorage.theme = themeName.value;
}
</script>

<style scoped>
.page-header {
  margin-top: 12px;
  margin-bottom: 10px;
}
</style>
