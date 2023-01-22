<template>
  <Transition>
    <n-result
      status="403"
      title="数据更新成功"
      description="记得还原代理配置哦~"
      size="large"
      v-if="show"
    >
      <template #footer>
        <n-button @click="returnHome">返回首页</n-button>
      </template>
      <template #icon>
        <div
          ref="emojiRef"
          style="
            display: flex;
            justify-content: center;
            align-items: center;
            height: 128px;
            width: 128px;
          "
        >
          <img
            src="/Twemoji_1f389.svg"
            style="display: block; width: 100%; height: 100%"
          />
        </div>
      </template>
    </n-result>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { onBeforeMount, onMounted } from "@vue/runtime-core";
import confetti from "canvas-confetti";

const emojiRef = ref(null);
const show = ref(false);

function firework() {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  const interval = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    var particleCount = 50 * (timeLeft / duration);
    // since particles fall down, start a bit higher than random
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      })
    );
    confetti(
      Object.assign({}, defaults, {
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      })
    );
  }, 250);
}

function returnHome() {
  window.location.href = "/";
}

onMounted(() => {
  setTimeout(() => {
    show.value = true;
    firework();
  }, 500);
});
</script>

<style scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.4s ease;
}
.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>>