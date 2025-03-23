<template>
    <div class="container mx-auto">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 h-full py-8">
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

const items = ref([
    [
        {
            label: 'Home',
            icon: 'i-lucide-home',
            to: '/',
            active: true
        },
        {
            label: 'About Me',
            icon: 'i-lucide-user',
            to: '/about'
        },
        {
            label: 'Recipes',
            icon: 'uil:diary',
            to: '/',
            active: false
        }
    ],
])

</script>

<style lang="scss" scoped>


</style>