<template>
  <div class="button-group">
    <t-button
      v-if="isPosts && !frontmatter.isNoBackBtn"
      theme="default"
      variant="dashed"
      style="margin-bottom: 10px"
      @click="goBack"
    >
      <template #icon><RollbackIcon /></template>
      {{ isEN ? "Go back " : "返回上一页" }}
    </t-button>
    <t-button
      v-if="!frontmatter.isNoBackBtn"
      theme="primary"
      style="margin-bottom: 10px"
      variant="dashed"
      @click="copyLink"
    >
      <template #icon><CopyIcon /></template>
      复制短链接
    </t-button>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRoute, useData } from "vitepress"
import { RollbackIcon, CopyIcon } from "tdesign-icons-vue-next"

const route = useRoute()
const isEN = computed(() => route.path.startsWith("/en"))
const isPosts = computed(
  () => route.path.startsWith("/posts") || route.path.startsWith("/en/posts")
)
const { frontmatter } = useData()

const goBack = () => {
  if (window.history.length <= 1) {
    location.href = "/"
  } else {
    window.history.go(hashChangeCount.value)
    hashChangeCount.value = -1
  }
}

const copyLink = () => {}
const hashChangeCount = ref(-1)
onMounted(() => {
  window.onhashchange = () => {
    hashChangeCount.value--
  }
})

onUnmounted(() => {
  window.onhashchange = null
})
</script>
<style scoped>
.button-group {
  display: flex;
  button {
    flex: 1;
    margin-right: 10px;
    &:last-child {
      margin-right: 0;
    }
  }
}
.img-container {
  height: 105px;
  width: 100px;
}

img {
  height: 100px;
  border-radius: 5px;
  margin-top: 5px;
}
</style>

