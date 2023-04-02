<template>
  <n-card title="常见问题">
    <n-collapse>
      <n-collapse-item title="查分器账户是什么？在哪里注册？" name="1">
        <n-p>
          查分器账户是你在<n-a
            target="_blank"
            href="https://www.diving-fish.com/maimaidx/prober/"
            >舞萌DX查分器</n-a
          >网站上注册的账户；通过链接访问网站并点击"登录并同步数据"，在弹窗中选择“立即注册”即可进行注册。
        </n-p>
      </n-collapse-item>
      <n-collapse-item title="查分器账户如何绑定 QQ ？" name="2">
        <n-p>
          前往<n-a
            target="_blank"
            href="https://www.diving-fish.com/maimaidx/prober/"
            >舞萌DX查分器</n-a
          >网站并登录，点击“编辑个人资料”中可以绑定QQ，绑定成功后就可以在QQ群中用BOT生成B40了！
        </n-p>
      </n-collapse-item>
      <n-collapse-item title="联系作者" name="3">
        <n-space>
          <n-button @click="contactQQ">
            <template #icon>
              <n-icon>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 1024 1024"
                >
                  <path
                    d="M824.8 613.2c-16-51.4-34.4-94.6-62.7-165.3C766.5 262.2 689.3 112 511.5 112C331.7 112 256.2 265.2 261 447.9c-28.4 70.8-46.7 113.7-62.7 165.3c-34 109.5-23 154.8-14.6 155.8c18 2.2 70.1-82.4 70.1-82.4c0 49 25.2 112.9 79.8 159c-26.4 8.1-85.7 29.9-71.6 53.8c11.4 19.3 196.2 12.3 249.5 6.3c53.3 6 238.1 13 249.5-6.3c14.1-23.8-45.3-45.7-71.6-53.8c54.6-46.2 79.8-110.1 79.8-159c0 0 52.1 84.6 70.1 82.4c8.5-1.1 19.5-46.4-14.5-155.8z"
                    fill="currentColor"
                  ></path>
                </svg>
              </n-icon>
            </template>
            QQ
          </n-button>

          <n-button @click="openWindow('https://space.bilibili.com/919174')">
            <template #icon>
              <bilibili-logo></bilibili-logo>
            </template>
            B站私信
          </n-button>

          <n-button
            @click="
              openWindow(
                'https://github.com/bakapiano/maimaidx-prober-updater/issues'
              )
            "
          >
            <template #icon>
              <n-icon :component="LogoGithub" />
            </template>
            Github issues
          </n-button>

          <n-button @click="openWindow('mailto:bakapiano@outlook.com')">
            <template #icon>
              <n-icon :component="MailOpenSharp" />
            </template>
            E-mail
          </n-button>
        </n-space>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>

<script setup>
import { useMessage } from 'naive-ui'
import { LogoGithub, MailOpenSharp } from '@vicons/ionicons5'
import BilibiliLogo from './BilibiliLogo.vue'

const message = useMessage()

function contactQQ() {
  navigator.clipboard.writeText('2514965141')
  message.success('QQ号已复制到剪切板')
  // openWindow("mqqwpa://im/chat?chat_type=wpa&uin=2514965141&version=1&src_type=web&web_src=oicqzone.com");
}

function openWindow(url) {
  window.open(url)
}
</script>
