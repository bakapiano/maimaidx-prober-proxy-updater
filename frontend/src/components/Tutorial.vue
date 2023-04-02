<template>
  <div style="margin-bottom: 48px">
    <n-h1>数据更新器使用指南</n-h1>
    <n-collapse>
      <n-collapse-item name="1">
        <template #header>
          <n-h2 style="margin: 0">视频版教程</n-h2>
        </template>
        <div>
          <n-button
            secondary
            size="small"
            round
            @click="openWindow('https://space.bilibili.com/919174')"
          >
            <template #icon>
              <bilibili-logo></bilibili-logo>
            </template>
            Bakapiano
          </n-button>
          B站关注<n-a href="https://space.bilibili.com/919174" target="_blank"
            >Bakapiano</n-a
          >谢谢喵！
        </div>
      </n-collapse-item>
      <n-collapse-item name="2">
        <template #header>
          <n-h2 style="margin: 0">文字版教程</n-h2>
        </template>
        <div>
          <n-h3>1. 在微信中打开网站</n-h3>
          <div>
            <n-a @click="copyToClipBoard">复制网站链接</n-a
            >并发送至任意聊天窗口中，使用微信内置浏览器打开本页面；
            或使用微信扫描下方二维码（点击可放大）:
          </div>
          <div style="display: flex">
            <n-image height="180" object-fit="scale-down" src="/qrcode.png" />
          </div>
          <n-h3>2. 配置系统代理</n-h3>
          <n-space vertical>
            <n-alert title="Warning" type="warning">
              更新成功后记得还原代理配置！
            </n-alert>
            <div>
              设置系统代理服务器地址为
              <n-tag>proxy.bakapiano.com:2560</n-tag>，点击系统按钮查看教程：
            </div>
            <n-button-group vertical>
              <n-button
                v-for="item in platformList"
                :key="item.title"
                @click="showTutroial(item.title)"
              >
                <template #icon>
                  <n-icon :component="item.compnent" />
                </template>
                {{ item.title }}
              </n-button>
            </n-button-group>
          </n-space>
          <n-h3>3. 填写查分器账号信息并提交</n-h3>
          <div>
            在当前网页中填写<n-a
              target="_blank"
              href="https://www.diving-fish.com/maimaidx/prober/"
              >舞萌DX查分器</n-a
            >的登录信息并提交。
          </div>
          <n-modal v-model:show="showModal" preset="card" :title="current">
            <div v-if="current == 'Windows 10'">
              开始菜单(win键) → 设置 → 网络和 Internet → 左侧导航栏中选择“代理”
              → 手动设置代理 → 地址填
              <n-a @click="copyTextToClipBoard('proxy.bakapiano.com')"
                >proxy.bakapiano.com</n-a
              >
              端口填 <n-a @click="copyTextToClipBoard('2560')">2560</n-a>
              → 点击保存
              <br />
              <n-image src="/windows10.png" width="100%" />
            </div>

            <div v-else-if="current == 'Android'">施工中...</div>

            <div v-else-if="current == 'IOS'">施工中...</div>

            <div v-else-if="current == 'IOS 小火箭'">施工中...</div>

            <div v-else-if="current == '其他平台'">施工中...</div>

            <div v-else-if="current == '其他代理软件'">施工中...</div>
          </n-modal>
        </div>
      </n-collapse-item>
    </n-collapse>
  </div>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import { ref } from 'vue'
import {
  LogoWindows,
  LogoAndroid,
  LogoApple,
  Rocket,
  Apps,
  Airplane,
} from '@vicons/ionicons5'
import BilibiliLogo from './BilibiliLogo.vue'

const message = useMessage()

const showModal = ref(false)
const current = ref('')
const platformList = [
  {
    title: 'Windows 10',
    compnent: LogoWindows,
  },
  {
    title: 'Android',
    compnent: LogoAndroid,
  },
  {
    title: 'IOS',
    compnent: LogoApple,
  },
  {
    title: 'IOS 小火箭',
    compnent: Rocket,
  },
  {
    title: '其他平台',
    compnent: Apps,
  },
  {
    title: '其他代理软件',
    compnent: Airplane,
  },
]

async function copyToClipBoard() {
  navigator.clipboard.writeText(window.location.href)
  message.success('链接已复制到剪切板')
}

async function copyTextToClipBoard(text) {
  navigator.clipboard.writeText(text)
  message.success('已复制到剪切板')
}

function showTutroial(title) {
  current.value = title
  showModal.value = true
  console.log(title, current, showModal)
}

function openWindow(url) {
  window.open(url)
}
</script>

<style>
.n-image img {
  width: 100%;
}

.n-h3 {
  margin-bottom: 12px;
  margin-top: 12px;
}
</style>
