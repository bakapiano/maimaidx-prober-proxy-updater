<template>
  <n-config-provider
    :theme="themeName == 'light' ? lightTheme : darkTheme"
    style="height: 100%"
  >
    <n-global-style />
    <n-dialog-provider>
      <n-message-provider>
        <HomePage @switch-theme="switchTheme" :theme-name="themeName" />
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup >
import HomePage from "./components/HomePage.vue";
import { defineComponent, provide, ref } from "vue";
import { darkTheme, lightTheme } from "naive-ui";

let themeName = ref(localStorage.theme === "dark" ? "dark" : "light");

provide("themeName", themeName);

function switchTheme() {
  themeName.value = themeName.value == "light" ? "dark" : "light";
  localStorage.theme = themeName.value;
}
</script>
