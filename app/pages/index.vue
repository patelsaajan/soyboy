<template>
    <div class="container mx-auto h-screen">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 h-full py-8">
            <PartsRecipeCard 
                v-for="(recipe, index) in recipes" 
                :key="index" 
                :recipe="recipe"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>

const { data: recipes } = await useAsyncData('navigation', async () => {
    const data = await queryCollectionNavigation('recipes', ['uri', 'time', 'cuisine', 'serves', 'imgSrc']);
    return data[0]?.children;
})

</script>

<style lang="scss" scoped>


</style>