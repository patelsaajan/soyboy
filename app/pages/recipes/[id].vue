<template>
    <div class="container mx-auto min-h-screen pt-8 pb-20">
        <div class="flex flex-col gap-y-6 w-full">
          <UBreadcrumb
            :items="items"
          />
            <div class="flex flex-col gap-y-6 w-full md:flex-row md:gap-x-10 lg:gap-x-20 md:items-center md:justify-center">
            <PartsImgSingle
              v-if="pageMeta?.imgSrc && pageMeta?.title"
              :imgSrc="`/imgs/recipes/${pageMeta.imgSrc}`"
              :alt="pageMeta.title"
              />
            <div class="md:my-10">
              <span class="flex text-primary text-xl w-full justify-center mb-6">Ingredients</span>
              <div class="flex flex-col gap-y-3 w-full md:w-[300px] mx-auto">
                <div
                  v-if="pageMeta"
                  v-for="ingredient in pageMeta.ingredients"
                  class="flex flex-row justify-between"
                >
                <span>{{ingredient.item}}</span>
                <span>{{ingredient.quantity}}</span>
                </div>
              </div>
            </div>
            <div class="md:my-10">
              <span class="flex text-primary text-xl w-full justify-center mb-6">Nutritional</span>
              <div class="flex flex-col gap-y-3 w-full md:w-[300px] mx-auto">
                <div
                  v-if="pageMeta"
                  v-for="nutritional in pageMeta.nutritional"
                  class="flex flex-row justify-between"
                >
                <span>{{nutritional.item}}</span>
                <span>{{nutritional.value}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="max-w-5xl mx-auto">
            <span class="text-primary text-3xl">{{ pageMeta?.title }}</span>
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
  return queryCollection('recipes').path(route.path).first()
})

const { data: pageMeta } = await useAsyncData('recipe-ingredients', () => {
  return queryCollection('recipes')
    .select('ingredients', 'imgSrc', 'title', 'nutritional')
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
    to: '/'
  },
])

onMounted(() => {
  if (pageMeta.value && pageMeta.value.title && typeof pageMeta.value.title === 'string') {
    items.value.push({
      label: pageMeta.value.title,
      icon: 'i-lucide-utensils-crossed',
      to: '/components/breadcrumb'
    })
  }
})



console.log('ingredients', pageMeta.value?.imgSrc)

</script>

<style lang="scss" scoped>

</style>