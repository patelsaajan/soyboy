
<template>
  <div class="container mx-auto">
    <ContentRenderer v-if="about" :value="about" />
    <div v-else>page not found</div>   
  </div>
</template>

  <script setup lang="ts">
  const route = useRoute()
  const { data: about } = await useAsyncData(() => queryCollection('content').path(route.path).first())
  
  useSeoMeta({
    title: about.value?.title,
    description: about.value?.description
  })

  

  // const { data } = await useAsyncData(() => queryCollection('content'))

  </script>