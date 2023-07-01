<template>
  <n-spin :show="loadingMusicData">
    <div v-if="!loadingMusicDataError" style="margin-top: 24px">
      <!-- <n-card title="查分器用户名"> -->
      <h1>获取 B50</h1>
      <n-input-group style="margin-top: 8px">
        <n-select
          v-model:value="queryType"
          :options="selectOptions"
          :style="{ width: '96px' }"
          placeholder="类型"
          default-value="username"
        />
        <n-input
          v-model:value="queryValue"
          :style="{ width: '320px' }"
          placeholder=""
        />
        <n-button type="primary" @click="onQueryUserScore"> 获取 </n-button>
        <!-- <n-button @click="onExportImage"> 导出图片 </n-button> -->
      </n-input-group>
      <!-- </n-card> -->
      <div v-if="playerData" id="score" style="margin-top: 24px">
        <h1 style="margin-bottom: 16px">
          Base Rating:
          <span style="color: gold">
            {{
              playerData.records.reduce(
                (total, record) => total + Number(record.ra),
                0
              )
            }}
          </span>
        </h1>
        <!-- <n-divider /> -->
        <h1>旧铺面 BEST 35</h1>
        <n-grid
          x-gap="12"
          cols="2 400:3 600:4 800:5 1000:6 1200:7 1400:8"
          responsive="self"
        >
          <n-gi v-for="(data, index) in getB35(playerData)" :key="index">
            <music-record :data="data" />
          </n-gi>
          <!-- <n-gi> -->
          <!-- {{ getB25(playerData) }} -->
          <!-- </n-gi> -->
        </n-grid>
        <n-divider />
        <h1>DX2022 BEST 15</h1>
        <n-grid
          x-gap="12"
          cols="2 400:3 600:4 800:5 1000:6 1200:7 1400:8"
          responsive="self"
        >
          <n-gi v-for="(data, index) in getB15(playerData)" :key="index">
            <music-record :data="data"> </music-record>
          </n-gi>
        </n-grid>
        <n-divider />
      </div>
    </div>
    <n-result
      v-else
      status="error"
      title="获取乐曲数据时出现错误"
      :description="`成绩页面不可用`"
    />
  </n-spin>
</template>

<script setup>
import MusicRecord from '../components/MusicRecord.vue'
import { getMusicData, getPlayerData } from '../api/prober.js'
import { ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import domtoimage from 'dom-to-image'

const message = useMessage()

const playerData = ref(null)
const loadingMusicData = ref(true)
const loadingMusicDataError = ref(false)
const musicData = ref(null)
const musicDataDict = {}

const queryType = ref('username')
const queryValue = ref('')

const selectOptions = [
  {
    label: '绑定QQ',
    value: 'qq',
  },
  {
    label: '用户名',
    value: 'username',
  },
]

watch(() => {
  getMusicData()
    .then((result) => {
      musicData.value = result.data
      musicData.value.forEach((data) => {
        musicDataDict[data.id] = data
      })
      message.success('获取乐曲数据成功')
    })
    .finally(() => (loadingMusicData.value = false))
    .catch(() => {
      loadingMusicDataError.value = true
      message.error('获取乐曲数据失败')
    })
}, [])

const queryLock = ref(false)

// TODO: Add save screen shoot to local
function onExportImage() {
  domtoimage.toBlob(document.getElementById('score')).then(function (blob) {
    window.saveAs(blob, 'my-node.png')
  })
}

function onQueryUserScore() {
  if (queryValue.value === '')
    return message.error('请输入查分器用户名或绑定的QQ号')
  if (queryLock.value) return
  queryLock.value = true

  const loading = message.loading('正在获取成绩数据', { duration: 0 })
  getPlayerData({
    qq: queryType.value === 'qq' ? queryValue.value : null,
    username: queryType.value === 'username' ? queryValue.value : null,
    b50: true,
  })
    .then((result) => {
      console.log(result.data)
      playerData.value = {
        records: result.data.charts.dx.concat(result.data.charts.sd),
      }
      console.log(playerData.value.records)
      message.success('获取成绩数据成功')
    })
    .catch((err) => {
      console.log(err)
      loading.destroy()
      message.error(
        `获取成绩数据失败: ${err?.response?.data?.message || '未知错误'}`
      )
    })
    .finally(() => ((queryLock.value = false), loading.destroy()))
}

function isNew(record) {
  return musicDataDict[record.song_id].basic_info.is_new > 0
}

function getB35(playerData) {
  if (playerData === null) return []
  return playerData.records
    .filter((record) => !isNew(record))
    .sort((a, b) => b.ra - a.ra)
    .slice(0, 35)
}

function getB15(playerData) {
  if (playerData === null) return []
  return playerData.records
    .filter((record) => isNew(record))
    .sort((a, b) => b.ra - a.ra)
    .slice(0, 15)
}
</script>

<style scoped>
h1 {
  margin-top: -12px;
  margin-bottom: 0px;
}
</style>
