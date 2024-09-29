<template></template>
<script setup lang="ts">
import { useData } from "vitepress"
import { watch, onMounted, onUnmounted } from "vue"

const { isDark } = useData()

// tdesign 暗色切换 https://tdesign.tencent.com/vue-next/dark-mode
const updateThemeMode = () => {
  if (isDark.value) {
    document.documentElement.setAttribute("theme-mode", "dark")
  } else {
    document.documentElement.removeAttribute("theme-mode")
  }
}

// 在组件挂载时立即执行一次
onMounted(() => {
  updateThemeMode()

  // 监听 isDark 的变化
  watch(isDark, updateThemeMode)
})

// 在组件卸载时移除属性
onUnmounted(() => {
  document.documentElement.removeAttribute("theme-mode")
})

// watch(
//   isDark,
//   () => {
//     if (isDark.value) {
//       window.document.documentElement.setAttribute("theme-mode", "dark")
//     } else {
//       window.document.documentElement.removeAttribute("theme-mode")
//     }
//   },
//   {
//     immediate: true,
//   }
// )
</script>

