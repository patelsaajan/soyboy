<template>
    <div class="container">
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 h-full py-8">
            <PartsRecipeCard 
                v-for="n in 12" 
                :key="n" 
                :recipe="todaysRecipe"
            />
        </div>
    </div>
</template>

<script lang="ts" setup>
import type IRecipes from '~~/types/recipes';


const todaysRecipe : IRecipes = {
        name: 'Korean Satay Sauce Tofu',
        cuisine: 'Korean',
        description: 'This is a delicious recipe that will make your day special This is a delicious recipe that will make your day special This is a delicious recipe that will make your day special This is a delicious recipe that will make your day special',
        image: '/imgs/default-food.jpg',
        difficulty: 'easy',
        preparationTime: 30,
        servings: 4,
};

const appConfig = useAppConfig()

</script>

<style lang="scss" scoped>


</style>