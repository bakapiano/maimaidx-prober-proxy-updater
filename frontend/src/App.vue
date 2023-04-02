<template>
  <n-config-provider
    :theme="themeName == 'light' ? lightTheme : darkTheme"
    style="height: 100%"
  >
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <n-layout position="absolute">
          <!-- header -->
          <n-layout-header
            position="absolute"
            style="
              z-index: 999;
              height: 64px;
              display: flex;
              align-items: center;
              padding: 0px 48px;
            "
            bordered
          >
            <!-- <n-grid cols="12" responsive="screen" item-responsive style="height: 100%; display: flex; align-items: center;"> -->
            <!-- <n-gi span="1 1:2" /> -->
            <!-- <n-gi span="10 1:8" style="height: 100%; width: 100%; "> -->
            <n-page-header
              title="舞萌/中二查分器数据更新器"
              style="width: 100%"
            >
              <template #extra>
                <n-button
                  circle
                  strong
                  quaternary
                  size="small"
                  @click="switchTheme"
                >
                  <n-icon>
                    <moon v-if="themeName == 'light'"></moon>
                    <sunny v-else></sunny>
                  </n-icon>
                </n-button>
              </template>
            </n-page-header>
            <!-- </n-gi> -->
            <!-- <n-gi span="1 1:2" /> -->
            <!-- </n-grid> -->
          </n-layout-header>

          <!-- body -->
          <n-layout
            has-sider
            position="absolute"
            style="top: 64px; bottom: 0px"
          >
            <!-- sider -->
            <n-layout-sider
              :position="breakpointRef.length == 1 ? 'absolute' : 'static'"
              :show-trigger="true"
              :native-scrollbar="false"
              bordered
              stle="z-index: 998;"
              style="z-index: 998244353"
              collapse-mode="width"
              :collapsed-width="0"
              :width="96"
              :collapsed="collapsed"
              :collapsed-trigger-style="'right: -20px'"
              @collapse="collapsed = true"
              @expand="collapsed = false"
            >
              <n-menu
                :options="menuOptions"
                :collapsed="collapsed"
                :collapsed-width="0"
                :value="defaultSelectedKeys"
              >
              </n-menu>
            </n-layout-sider>

            <!-- content -->
            <n-layout
              :native-scrollbar="false"
              style="margin-top: 12px"
              @click="
                () => {
                  if (!collapsed && breakpointRef.length == 1) collapsed = true
                }
              "
            >
              <n-spin :show="loading" size="large">
                <n-grid cols="24" responsive="screen" item-responsive>
                  <n-gi span="1 1:4" />
                  <n-gi span="22 1:16">
                    <RouterView></RouterView>
                    <!-- <div style="display: flex; justify-content: space-around;">
                      {{`maimaiDX-prober-proxy-updater by bakapiano, ${new Date().getFullYear()}-2077`}}
                    </div> -->
                  </n-gi>
                  <n-gi span="1 1:4" />
                </n-grid>
              </n-spin>
            </n-layout>
          </n-layout>
        </n-layout>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import { provide, ref, onMounted, h, watch } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import { RouterView } from 'vue-router'
import { Moon, Sunny } from '@vicons/ionicons5'
import { useRoute, useRouter } from 'vue-router'
import { useBreakpoints } from 'vooks'
import { RouterLink } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breakpointRef = useBreakpoints()

const collapsed = ref(true)

console.log(breakpointRef.value, collapsed.value)

let themeName = ref(localStorage.theme === 'dark' ? 'dark' : 'light')

provide('themeName', themeName)

const loading = ref(true)

onMounted(() => (loading.value = false))

function switchTheme() {
  themeName.value = themeName.value == 'light' ? 'dark' : 'light'
  localStorage.theme = themeName.value
}

const defaultSelectedKeys = ref(undefined)
watch(router.currentRoute, () => {
  defaultSelectedKeys.value = router.currentRoute.value.name
})

const menuOptions = [
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/',
          },
        },
        { default: () => '主页' }
      ),
    key: 'home',
  },
  {
    label: () =>
      h(
        RouterLink,
        {
          to: {
            path: '/score/',
          },
        },
        { default: () => '成绩' }
      ),
    key: 'score',
    to: '/score',
  },
]
</script>

<style scoped>
.page-header {
  /* use flex to keep cetner in y */
  height: 100%;
  width: 100%;
}
</style>
