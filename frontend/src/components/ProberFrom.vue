<template>
  <n-spin :show="loading">
    <n-card class="card" title="导入数据">
      <n-tabs
        default-value="maimai-dx"
        size="large"
        animated
        @update:value="(value) => (updateType = value)"
      >
        <n-tab-pane
          v-for="updateType in ['maimai-dx', 'chunithm']"
          :key="updateType"
          :name="updateType"
          :tab="updateType"
        >
          <n-space vertical>
            <n-form
              ref="formRef"
              class="form"
              :model="formValue"
              :rules="rules"
            >
              <n-form-item path="username" label="查分器账号">
                <n-input
                  v-model:value="formValue.username"
                  placeholder="username"
                />
              </n-form-item>
              <n-form-item path="password" label="查分器密码">
                <n-input
                  v-model:value="formValue.password"
                  type="password"
                  show-password-on="click"
                  placeholder="password"
                />
              </n-form-item>
              <n-form-item path="allDiff" label="更新所有难度">
                <n-switch v-model:value="formValue.allDiff">
                  <template #checked>All difficulties</template>
                  <template #unchecked> Expert,Master,Re:Master </template>
                </n-switch>
              </n-form-item>
              <n-form-item label="记住账号密码">
                <n-switch v-model:value="remember" @change="rememberChange" />
              </n-form-item>
            </n-form>
          </n-space>
        </n-tab-pane>
      </n-tabs>
      <template #action>
        <n-space justify="space-between">
          <n-space>
            <n-button type="success" @click="() => submit(updateType)">
              更新
            </n-button>
            <n-button v-model:value="remember" type="error" @click="clearForm">
              清空
            </n-button>
          </n-space>
          <div style="display: flex; align-items: center; height: 100%">
            <n-a @click="() => genShortcut(updateType)"> 快速更新链接 </n-a>
          </div>
        </n-space>
      </template>
    </n-card>

    <n-modal
      v-model:show="showModal"
      preset="card"
      style="max-width: 1080px"
      title="快速跳转链接"
    >
      <n-p>
        使用方法：将链接发送到微信任意聊天框中（推荐文件传输助手），<strong>代理配置正确后</strong>点击链接即可进行数据更新。<strong
          >注意：短链接包含你的查分器账户和密码信息，请不要将链接分享给其他人！</strong
        >
      </n-p>
      点击选中链接：
      <n-tag type="info" @click="selectContent" @touchstart="selectContent">
        <p id="short-cut" ref="shortCutRef">
          {{ shortCut }}
        </p>
      </n-tag>
    </n-modal>
  </n-spin>
</template>

<script setup>
import { postForm } from '../api/form.js'
import { ref, onMounted } from 'vue'
import { useMessage, useDialog } from 'naive-ui'

const props = defineProps(['proxyStatus'])
const message = useMessage()
const dialog = useDialog()

const loading = ref(false)
const formRef = ref(null)
const formValue = ref({
  username: '',
  password: '',
})
const remember = ref(false)
const rules = ref({
  username: {
    required: true,
    message: '请输入查分器账户',
  },
  password: {
    required: true,
    message: '请输入查分器密码',
  },
})
const shortCut = ref('')
const showModal = ref(false)
const shortCutRef = ref(null)
const updateType = ref('maimai-dx')

onMounted(() => {
  remember.value = window.localStorage.remember === 'true' ? true : false
  if (window.localStorage.username !== undefined)
    formValue.value.username = window.localStorage.username
  if (window.localStorage.password !== undefined)
    formValue.value.password = window.localStorage.password
})

function saveToLocalStorage() {
  if (!remember.value) return
  window.localStorage.username = formValue.value.username
  window.localStorage.password = formValue.value.password
}

function clearLocalStorage() {
  delete window.localStorage.username
  delete window.localStorage.password
}

function clearForm() {
  console.log('clear-form')
  clearLocalStorage()
  formValue.value.username = formValue.value.password = ''
}

function rememberChange(value) {
  remember.value = window.localStorage.remember = value
  value ? saveToLocalStorage() : clearLocalStorage()
  console.log(value, remember.value, window.localStorage.remember)
}

function selectContent() {
  const range = document.createRange()
  const node = document.getElementById('short-cut')
  const selection = window.getSelection()
  range.selectNode(node)
  selection.removeAllRanges()
  window.getSelection().addRange(range)
}

async function genShortcut(type) {
  if (!(await post(type, false))) return
  showModal.value = true
  let url = `${window.location.protocol}//${window.location.host}/shortcut?`
  const callbackHost = window.location.host
  url += `callbackHost=${encodeURIComponent(callbackHost)}`
  url += `&username=${encodeURIComponent(formValue.value.username)}`
  url += `&password=${encodeURIComponent(formValue.value.password)}`
  url += `&allDiff=${encodeURIComponent(formValue.value.allDiff !== undefined ? formValue.value.allDiff : false)}`
  url += `&type=${encodeURIComponent(type)}`
  console.log(url)
  shortCut.value = url
}

async function post(type, jump = true) {
  loading.value = true
  try {
    const result = await postForm(
      formValue.value.username,
      formValue.value.password,
      type,
      formValue.value.allDiff !== undefined ? formValue.value.allDiff : false
    )
    console.log(result.data)
    saveToLocalStorage()
    if (jump) {
      window.location.href = result.data
    }

    loading.value = false
    return true
  } catch (err) {
    console.log(err)
    message.error(err.response.data ? err.response.data : err.message)
    clearLocalStorage()
  }

  loading.value = false
  return false
}

function submit(type) {
  console.log(type)
  formRef.value[0].validate((errors) => {
    console.log(props.proxyStatus)
    if (!errors) {
      if (!props.proxyStatus) {
        dialog.warning({
          title: 'Warning',
          content: '代理配置存在问题，可能会导致数据更新不成功，是否继续？',
          negativeText: '取消',
          positiveText: '继续',
          onPositiveClick: () => {
            post(type)
          },
          autoFocus: false,
        })
      } else post(type)
    } else {
      console.log(errors)
    }
  })
}
</script>

<style scoped>
.form {
  margin-top: 6px;
}
</style>
