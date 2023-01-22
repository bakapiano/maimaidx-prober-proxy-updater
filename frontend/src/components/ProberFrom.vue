<template>
  <n-spin :show="loading">
    <n-card class="card" title="导入数据">
      <n-space vertical>
        <n-form
          ref="formRef"
          label-placement="left"
          :model="formValue"
          :rules="rules"
        >
          <n-form-item path="username">
            <n-input
              placeholder="查分器账号"
              v-model:value="formValue.username"
            />
          </n-form-item>
          <n-form-item path="password">
            <n-input
              type="password"
              show-password-on="click"
              placeholder="查分器密码"
              v-model:value="formValue.password"
            />
          </n-form-item>
          <n-space vertical>
            <n-checkbox value="" @change="rememberChange" :checked="remember">
              记住账号和密码
            </n-checkbox>
          </n-space>
        </n-form>
      </n-space>
      <template #action>
        <n-space justify="space-between">
          <n-space>
            <n-button type="success" @click="submit">提交</n-button>
            <n-button v-model:value="remember" @click="clearForm" type="error">
              清空
            </n-button>
            
          </n-space>
          <n-a @click="genShortcut">生成快速跳转链接</n-a>
        </n-space>
      </template>
    </n-card>

    <n-modal v-model:show="showModal" preset="card" style="max-width:1080px" title="快速跳转链接">
      <n-p>
        使用方法：将链接发送到微信任意聊天框中（推荐文件传输助手），<strong>代理配置正确后</strong>点击链接即可进行数据更新。<strong>注意：短链接包含你的查分器账户和密码信息，请不要将链接分享给其他人！</strong>
      </n-p>
      点击选中链接：
      <n-tag type="info" @click="selectContent" @touchstart="selectContent">
        <p id='short-cut' ref="shortCutRef">
          {{shortCut}}
        </p>
      </n-tag>
    </n-modal>
  </n-spin>
</template>

<script setup>
import { postForm } from "../api/form.js";
import { defineComponent, ref, onMounted } from "vue";
import { useMessage, useDialog } from "naive-ui";

const props = defineProps(["proxyStatus"]);
const message = useMessage();
const dialog = useDialog();

const loading = ref(false);
const formRef = ref(null);
const formValue = ref({
  username: "",
  password: "",
});
const remember = ref(false);
const rules = ref({
  username: {
    required: true,
    message: "请输入查分器账户",
  },
  password: {
    required: true,
    message: "请输入查分器密码",
  },
});
const shortCut = ref("");
const showModal = ref(false);
const shortCutRef = ref(null);

onMounted(() => {
  remember.value = window.localStorage.remember === "true" ? true : false;
  if (window.localStorage.username !== undefined)
    formValue.value.username = window.localStorage.username;
  if (window.localStorage.password !== undefined)
    formValue.value.password = window.localStorage.password;
});

function saveToLocalStorage() {
  if (!remember.value) return;
  window.localStorage.username = formValue.value.username;
  window.localStorage.password = formValue.value.password;
}

function clearLocalStorage() {
  delete window.localStorage.username;
  delete window.localStorage.password;
}

function clearForm() {
  console.log("clear-form");
  clearLocalStorage();
  formValue.value.username = formValue.value.password = "";
}

function rememberChange(value) {
  remember.value = window.localStorage.remember = value;
  value ? saveToLocalStorage() : clearLocalStorage();
  console.log(value, remember.value, window.localStorage.remember);
}

function selectContent() {
  const range = document.createRange()
  const node = document.getElementById('short-cut')
  const selection = window.getSelection()
  range.selectNode(node)
  selection.removeAllRanges()
  window.getSelection().addRange(range)
}

async function genShortcut() {
  if (!await post(false)) return;
  showModal.value = true
  let url = `${window.location.href}shortcut?`
  const successPageUrl = window.location.href + "#Success"
  url += `successPageUrl=${encodeURIComponent(successPageUrl)}`
  url += `&username=${encodeURIComponent(formValue.value.username)}`
  url += `&password=${encodeURIComponent(formValue.value.password)}`
  console.log(url)
  shortCut.value = url
}

async function post(jump = true) {
  loading.value = true;
  try {

    const result = await postForm(
      formValue.value.username,
      formValue.value.password
    );
    console.log(result.data);
    saveToLocalStorage();
    if (jump) {
      window.location.href = result.data;
    }

    loading.value = false;
    return true
  } 
  catch (err) {
    console.log(err);
    message.error(err.response.data ? err.response.data : err.message);
    clearLocalStorage();
  }

  loading.value = false;
  return false
}

function submit() {
  formRef.value?.validate((errors) => {
    console.log(props.proxyStatus);
    if (!errors) {
      if (!props.proxyStatus) {
        dialog.warning({
          title: "Warning",
          content: "代理配置存在问题，可能会导致数据更新不成功，是否继续？",
          negativeText: "取消",
          positiveText: "继续",
          onPositiveClick: () => {
            post();
          },
          autoFocus: false,
        });
      } else post();
    } else {
      console.log(errors);
    }
  });
}
</script>

<style scoped>
</style>
