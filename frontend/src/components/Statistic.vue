<template>
  <n-card :bordered="false">
    <n-statistic label="累计完成导入次数">
      <template #prefix>
        <n-icon>
          <rocket-outline />
        </n-icon>
      </template>
      <n-number-animation ref="numberAnimationInstRef" :from="last" :to="to" />
    </n-statistic>
  </n-card>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { RocketOutline } from "@vicons/ionicons5"
import { getCount } from "../api/count.js"

const last = ref(0)
const to = ref(0);

onMounted(async () => {
  const update = async () => {
    const { count } = (await getCount()).data
    last.value = to.value
    to.value = count
  }
  await update()
  setInterval(update, 1000 * 5)
});

</script>