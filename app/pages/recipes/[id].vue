<template>
    <div class="container mx-auto min-h-screen pt-8 pb-20">
        <div class="flex flex-col gap-y-6 w-full">
          <UBreadcrumb
            :items="items"
          />
            <div class="flex flex-col gap-y-6 w-full md:flex-row md:gap-x-10 lg:gap-x-20 md:items-center md:justify-center">
            <PartsImgSingle
              v-if="page?.imgSrc && page?.title"
              :imgSrc="`/imgs/recipes/${page.imgSrc}`"
              :alt="page.title"
              />
            <div class="md:my-10">
              <span class="flex text-primary text-xl w-full justify-center mb-6">Ingredients</span>
              <div class="flex flex-col gap-y-3 w-full md:w-[300px] mx-auto">
                <div
                  v-if="page"
                  v-for="ingredient in page.ingredients"
                  class="flex flex-row justify-between"
                >
                <span>{{ingredient.item}}</span>
                <span>{{ingredient.quantity}}</span>
                </div>
              </div>
            </div>
            <div class="md:my-10">
              <span class="flex text-primary text-xl w-full justify-center mb-6">Nutritional <span class="text-sm">(per serve)</span></span>
              <div class="flex flex-col gap-y-3 w-full md:w-[300px] mx-auto">
                <div
                  v-if="page"
                  v-for="nutritional in page.nutritional"
                  class="flex flex-row justify-between"
                >
                <span>{{nutritional.item}}</span>
                <span>{{nutritional.value}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="max-w-5xl mx-auto flex flex-col gap-y-1">
            <span class="text-primary text-lg font-bold">{{ page?.cuisine }}</span>
            <span class="text-primary text-3xl font-bold">{{ page?.title }}</span>
            <ContentRenderer 
              v-if="page?.title"
              :value="page" 
            />
        </div>
        </div>
    </div>
</template>

<script lang="ts" setup>

const route = useRoute()

definePageMeta({
  layout: 'neutral'
})

const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('recipes')
    .path(route.path)
    .first()
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
    to: '/recipes'
  },
])

onMounted(() => {
  if (page.value && page.value.title && typeof page.value.title === 'string') {
    items.value.push({
      label: page.value.title,
      icon: 'i-lucide-utensils-crossed',
      to: '/components/breadcrumb'
    })
  }
})



console.log('ingredients', page.value?.imgSrc)

</script>

<style lang="scss" scoped>

</style>