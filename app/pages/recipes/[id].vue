<template>
    <div class="container mx-auto min-h-screen">
        <ContentRenderer v-if="page" :value="page" />
    </div>
</template>

<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('recipes').path(route.path).first()
})


</script>

<style lang="scss" scoped>

</style>