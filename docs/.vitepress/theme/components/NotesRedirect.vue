<template></template>
<script setup lang="ts">
import { useRouter, useRoute } from "vitepress"
import { createSideBarZH } from "../utils/createSideBar"

const props = defineProps({
  prefix: {
    type: String,
    default: "/notes/",
  },
})

const router = useRouter()
const route = useRoute()

const { path } = route
const sideBar = createSideBarZH()

const firstItemLink = sideBar[props.prefix][0].items[0].link

router.go(firstItemLink)
</script>
<style scoped></style>

