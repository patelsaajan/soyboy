<script setup lang="ts">
const { data: about } = await useAsyncData(() => queryCollection('content').path('/').first())

useSeoMeta({
  title: about.value?.title,
  description: about.value?.description
})
</script>

<template>
  <ContentRenderer v-if="about" :value="about" />
  <div v-else>page not found</div>
</template>
