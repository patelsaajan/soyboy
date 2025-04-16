<template>
    <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 h-full py-8">
            <PartsRecipeCard 
                v-for="(recipe, index) in recipes" 
                :key="index" 
                :recipe="recipe"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>

useHead({
  title: 'Saajan\'s Recipes',
  meta: [
    { name: 'description', content: 'Saajan\'s Recipes' },
  ],
})

const { data: recipes } = await useAsyncData('navigation', async () => {
    const data = await queryCollectionNavigation('recipes', ['uri', 'time', 'cuisine', 'serves', 'imgSrc']).order('date', 'DESC');
    return data[0]?.children;
})

</script>

<style lang="scss" scoped>


</style>