<template>
    <div class="container mx-auto min-h-screen pt-6">
        <div class="flex flex-col gap-y-6">
          <UBreadcrumb :items="items" />
          <ContentRenderer v-if="page" :value="page" />
        </div>
    </div>
</template>

<script lang="ts" setup>
const route = useRoute()

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('recipes').path(route.path).first()
})

const items = ref([
  {
    label: 'Home',
    icon: 'i-lucide-house',
    to: '/'
  },
  {
    label: 'Recipes',
    icon: 'uil:diary',
    to: '/'
  },
])

onMounted(() => {
  if (page.value && typeof page.value.title === 'string') {
    items.value.push({
      label: page.value.title,
      icon: 'i-lucide-utensils-crossed',
      to: '/components/breadcrumb'
    })
  }
})



</script>

<style lang="scss" scoped>

</style>