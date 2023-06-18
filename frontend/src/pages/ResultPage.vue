<template>
  <n-spin :show="loadingFirstTrace">
    <n-card title="更新结果">
      <template v-if="error">
        <n-result status="error" title="未找到更新记录" :description="`UUID: ${uuid}`" />
      </template>
      <template v-else>
        <n-space vertical>
          <div>
            UUID:
            <n-tag :bordered="false">
              {{ uuid }}
            </n-tag>
          </div>
          <div class="log">
            <TransitionGroup name="list">
              <n-text v-for="line in data?.log?.split('\n')" :key="line" tag="div">
                {{ line || '' }}
              </n-text>
            </TransitionGroup>
            <div v-if="inProgress">
              <n-skeleton text style="width: 60%" />
              <n-skeleton text style="width: 60%" />
              <n-skeleton text style="width: 41%" />
            </div>
          </div>
        </n-space>
        <n-divider />
      </template>
      <n-progress v-if="!error" type="line" :status="{ running: 'info', success: 'success', failed: 'error' }[
        data?.status || 'running'
        ]
        " :percentage="data?.progress || 0" :show-indicator="false" :processing="data?.status === 'running'"
        :indicator-placement="'inside'" />
    </n-card>
  </n-spin>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getTrace } from '../api/trace.js'
import { useMessage } from 'naive-ui'

const MAX_FETCH_COUNT = 5

const route = useRoute()
const message = useMessage()

const data = ref(undefined)
const loadingFirstTrace = ref(true)
const error = ref(false)
const inProgress = ref(true)

const { uuid } = route.params
let intervalId = null
let failedFetchCount = 0 

watch(inProgress, async (value, oldValue) => {
  if (oldValue && !value) {
    clearInterval(intervalId)
    if (data?.value?.status) {
      data.value.status == 'success'
        ? message.success('数据更新成功')
        : message.error('更新数据时出现错误')
    }
  }
})

onMounted(
  () => intervalId === null &&
    (intervalId = setInterval(async () => {
      let result = undefined
      try {
        result = (await getTrace(uuid)).data
      } catch (_err) { /* empty */ }

      if (result && result.status) {
        data.value = result
        if (data.value?.status == 'failed' || data.value?.status == 'success') {
          inProgress.value = false
        }
        if (loadingFirstTrace.value) {
          loadingFirstTrace.value = false
        }
      } else if (loadingFirstTrace.value) {
        failedFetchCount += 1
        if (failedFetchCount >= MAX_FETCH_COUNT) {
          message.error(`未找到 ${uuid}`)
          inProgress.value = false
          loadingFirstTrace.value = false
          error.value = true
        }
      }
    }, 2000))
)
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.log {
  max-height: 480px;
  overflow-y: auto;
}
</style>
